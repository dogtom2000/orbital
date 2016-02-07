orbitBody = function(Planet, Rocket, orbit){ //, theta, phi

    //set constant, variable theta/phi could be implemented in future build
    var theta = 0;
    var phi = Math.PI / 2;
    var hvelScale = 0.90;
    var maxHeight = 0;

    //initialize variables
    var t = 0;
    var dt = 0;
    var tMax = 5000;
    var stopFlag = 0;
    var apoFlag = 0;
    var fuelFlag = 0;
    var error = "";
    var dvRequired = 0;
    var stageDv = 0;

    var standardGravity = 9.80665;

    var time = [0];
    var heading = [];
    var acceleration = [[0,0,0]]; //[d2r/dr2, d2theta/dt2, d2phi/dt2]
    var velocity = [[0,0,0]]; //[dr/dt, dtheta/dt, dphi/dt]
    var position = [[0,0,0]]; //[r, theta, phi]
    var positionAddLast = [0, Math.sin(phi) * 2 * Math.PI / Planet.dayLength, 0];

    //intial values
    velocity[0] = [0, Planet.radius * Math.sin(phi) * 2 * Math.PI / Planet.dayLength, 0];
    position[0] = [Planet.radius, theta, phi];

    //set current stage to first rocket stage
    var currentStage = Rocket.stages[Rocket.stageCount];

    for (var t = 0; t < tMax; t++){
        //check to see if rocket falls into planet, will happen if twr is insufficient
        if(position[t][0] < Planet.radius){
            stopFlag = 1;
            error = [0, "position inside planet, rocket has crashed"];
        }
        
        //if stage has no remaining fuel, proceed to next stage, if this is the final stage rocket is out of fuel
        if(currentStage[0][0] <= 0 && Rocket.stageCount > 1){
            delete Rocket.stages[Rocket.stageCount];
            Rocket.stageCount--;
            currentStage = Rocket.stages[Rocket.stageCount];
        } else if (currentStage[0][0] <= 0 && Rocket.stageCount == 1){
            stopFlag = 1;
            error = [1, "rocket is out of fuel"];
        }
        
        //assign stage variables
        var stageFuelMass = currentStage[0][0];
        var stageDryMass = currentStage[1];
        var stageMass = stageFuelMass + stageDryMass + currentStage[2];
        var stageDrag = currentStage[3];
        var stageArea = Math.PI / 4 * Math.pow(currentStage[4], 2);
        var stageThrust = currentStage[5];
        var stageIsp = currentStage[6];
        var stageBurnRate = stageThrust / stageIsp / standardGravity;
        
        //calculate surface speed
        var surfaceVelocity = arrayAdd(velocity[t], [0, - position[t][0] * Math.sin(phi) * 2 * Math.PI / Planet.dayLength, 0]);
        var surfaceSpeed = magn(surfaceVelocity);

        //calculate orbital properties
        var orbitalProperties = orbitalPropertiesCalc(velocity[t], position[t]);
        var apoapsis = orbitalProperties[0];
        var hvelocityApoapsis = orbitalPropertiesCalc([velocity[t][0], hvelScale * Math.pow(Planet.sgp / (Planet.radius + orbit), 0.5), velocity[t][2]], position[t])[0];
        
        //calculate accelerations
        var centripetalAcceleration = [(Math.pow(velocity[t][1],2) + Math.pow(velocity[t][2],2)) / position[t][0], 0, 0];
        var gravityAcceleration = [-Planet.sgp / Math.pow(position[t][0],2), 0, 0];
        if (surfaceSpeed === 0 || position[t][0] > Planet.atmHeight + Planet.radius){
            var dragAcceleration = [0,0,0];
        } else {
            var density = 0.042295 * Planet.pressure * Math.exp(-(position[t][0] - Planet.radius) / Planet.atmScale / 1000) * Planet.atmWeight;
            var dragFraction = -stageDrag * density * Math.pow(surfaceSpeed, 2) * stageArea / 2 / stageMass / surfaceSpeed;
            dragAcceleration = arrayMul(surfaceVelocity, dragFraction);
        }

        //calculate heading
        var headingFraction = (hvelocityApoapsis - apoapsis) / (Planet.radius + orbit - apoapsis);
        
        if (headingFraction < 0){
            headingFraction = 0;
        } else if (headingFraction > 0.975){
            headingFraction = 0.975;
        }
        
        heading = [headingFraction * Math.PI / 2, Math.PI / 2];
        
        //calculate thrust acceleration from heading
        var thrustVector = [Math.cos(heading[0]) * Math.sin(heading[1]), Math.sin(heading[0]) * Math.sin(heading[1]), Math.cos(heading[1])];
        var thrustAcceleration = arrayMul(thrustVector, stageThrust / stageMass);
        
        //add accerlations together
        acceleration[t] = arrayAddPlus(centripetalAcceleration, gravityAcceleration, dragAcceleration, thrustAcceleration);
        
        //if apoapsis is higher than targer and rocket is in atmosphere coast, but account for drag, if out of atmosphere coast
        apoFlag = 0;
        if (apoapsis - Planet.radius > orbit && position[t][0] - Planet.radius < Planet.atmHeight){
            stageBurnRate = magn(dragAcceleration) * stageMass / stageIsp / standardGravity;
            acceleration[t] = arrayAdd(centripetalAcceleration, gravityAcceleration);
        } else if (apoapsis - Planet.radius > orbit && position[t][0] - Planet.radius >= Planet.atmHeight) {
            acceleration[t] = arrayAdd(centripetalAcceleration, gravityAcceleration);
            apoFlag = 1;
        }
        
        //calculate fuel time steps
        fuelFlag--;
        if(fuelFlag < 0){
                fuelFlag = 0;
        }
        
        if (fuelFlag === 0){
            var fuelTick = 1;
            var tickFuel = stageFuelMass;
    
            while (tickFuel > 100){
                fuelTick *= 10;
                tickFuel /= 10;
            }
            dt = fuelTick / stageBurnRate;
            if (dt > 2){
                fuelFlag = Math.ceil(dt / 2);
                dt = dt / fuelFlag;
            }
        }

        if (apoFlag == 1){
            dt = 2;
        }

        //increment time, velocity, and position based on acceleration
        time[t + 1] = time[t] + dt;
        
        velocity[t + 1] = arrayAdd(velocity[t], arrayMul(acceleration[t], dt));
            
        var positionAdd = [velocity[t + 1][0], velocity[t + 1][1] / position[t][0], velocity[t + 1][2] / position[t][0]];

        var positionAddAve = arrayMul(arrayAdd(positionAdd, positionAddLast), 0.5);

        position[t + 1] = arrayAdd(position[t], arrayMul(positionAddAve, dt)); 

        positionAddLast = positionAdd;
        
        //if we are not coasting through vacuum remove fuel
        if (apoFlag !== 1){
            currentStage[0][0] = stageFuelMass - stageBurnRate * dt;
        }
        
        //if we have reached desired orbit calculate remaining fuel to remove
        if (position[t][0] > orbit + Planet.radius){
        
            //calculate required and current stage dv, calculate required acceleration capabilities
            dvRequired = Math.pow(Planet.sgp / (orbit + Planet.radius), 0.5) - velocity[t + 1][1];
            stageDv = Math.log(stageMass / stageDryMass) * stageIsp * standardGravity;
            var orbitalPeriod = 2 * Math.PI * (orbit + Planet.radius) / Math.pow(Planet.sgp / (orbit + Planet.radius), 0.5);
            var requiredAcceleration = 20 * dvRequired / orbitalPeriod;
 
            //determine if there is enoug thrust or fuel to complete orbital inseration
            while (dvRequired > 0 && stopFlag === 0){
                
                if (stageThrust / stageMass < requiredAcceleration){
                    stopFlag = 1;
                    error = [2 ,"not enough thrust to complete burn"];
                    break;
                }
                if (dvRequired > stageDv && Rocket.stageCount > 1){
                    dvRequired -= stageDv;
                    delete Rocket.stages[Rocket.stageCount];
                    Rocket.stageCount--;
                    currentStage = Rocket.stages[Rocket.stageCount];
                    stageFuelMass = currentStage[0][0];
                    stageDryMass = currentStage[1];
                    stageMass = stageFuelMass + stageDryMass + currentStage[2];
                    stageDrag = currentStage[3];
                    stageArea = Math.PI / 4 * Math.pow(currentStage[4], 2);
                    stageThrust = currentStage[5];
                    stageIsp = currentStage[6];
                    stageDv = Math.log(stageMass / stageDryMass) * stageIsp * standardGravity;
                } else if (dvRequired > stageDv && Rocket.stageCount == 1){
                    stopFlag = 1;
                    error = [3 ,"not enough fuel to complete burn"];
                    break;
                } else if (dvRequired < stageDv){
                    stageDv -= dvRequired;
                    dvRequired = 0;
                    Rocket.stages[Rocket.stageCount][0][0] = Math.round(Math.exp(stageDv / stageIsp / standardGravity) * stageDryMass - stageDryMass);
                    stopFlag = 1;
                    error = [4 ,"orbit achieved"];
                }
            }
            stopFlag = 1;
        }
        if (position[t][0] > maxHeight){
            maxHieght = position[t][0];
        }

        if (stopFlag == 1){
            break;
        }
        
        //if (t % 1 ==0){
            //console.log(t , time[t], Math.round(position[t][0]) - 6371000, position[t][1] * 6371000,Math.round(apoapsis - 6371000), Math.round(acceleration[t][0]*1000)/1000,  Math.round(acceleration[t][1]*1000)/1000, Math.round(velocity[t][0]), Math.round(velocity[t][1]), heading[0], dt, stageBurnRate, currentStage[0][0]);
            //console.log(heading[0],  Math.round(position[t][0]) - 6371000,Math.round(apoapsis - 6371000));
        //}
    }

    //return [error, Rocket, dvRequired, stageDv, position, velocity, acceleration];
    return [error, Rocket, maxHieght, position];
    
    //calculate orbital properties
    function orbitalPropertiesCalc(velocity, position){
        var angularMomentum = cross([position[0], 0, 0], velocity);
        var eccVector = arraySub(arrayDiv(cross(velocity, angularMomentum), Planet.sgp), [1, 0, 0]);
        var ecc = magn(eccVector);
        var orbitalEnergy = Math.pow(magn(velocity), 2) / 2 - Planet.sgp / position[0];
        var semiMajorAxis = -Planet.sgp / 2 / orbitalEnergy;
        var apoapsis = semiMajorAxis * (1 + Math.abs(ecc));
        var periapsis = semiMajorAxis * (1 - Math.abs(ecc));
        return [apoapsis, periapsis, semiMajorAxis, ecc];
    }
}

function arrayAdd(array, val){
    
    var arrayNew = [];
    if (Array.isArray(val)){
        if (array.length !== val.length){
            return "array length mismatch"
        } else {
            for (var i = 0; i < array.length; i++){
                arrayNew[i] = array[i] + val[i];
            }            
        } 
    } else {
        for (var i = 0; i < array.length; i++){
            arrayNew[i] = array[i] + val;
        }
    }
    return arrayNew;

}

function arraySub(array, val){
    
    var arrayNew = [];
    if (Array.isArray(val)){
        if (array.length !== val.length){
            return "array length mismatch"
        } else {
            for (var i = 0; i < array.length; i++){
                arrayNew[i] = array[i] - val[i];
            }            
        } 
    } else {
        for (var i = 0; i < array.length; i++){
            arrayNew[i] = array[i] - val;
        }
    }
    return arrayNew;

}

function arrayMul(array, val){
    
    var arrayNew = [];
    if (Array.isArray(val)){
        if (array.length !== val.length){
            return "array length mismatch"
        } else {
            for (var i = 0; i < array.length; i++){
                arrayNew[i] = array[i] * val[i];
            }            
        } 
    } else {
        for (var i = 0; i < array.length; i++){
            arrayNew[i] = array[i] * val;
        }
    }
    return arrayNew;

}

function arrayDiv(array, val){
    
    var arrayNew = [];
    if (Array.isArray(val)){
        if (array.length !== val.length){
            return "array length mismatch"
        } else {
            for (var i = 0; i < array.length; i++){
                arrayNew[i] = array[i] / val[i];
            }            
        } 
    } else {
        for (var i = 0; i < array.length; i++){
            arrayNew[i] = array[i] / val;
        }
    }
    return arrayNew;

}

function arrayAddPlus(){
    
    var newArray = [];
    for (var i = 0; i < arguments[0].length; i++){
        newArray[i] = 0;
        for (var j = 0; j < arguments.length; j++){
           newArray[i] += arguments[j][i]; 
        }
    }
  return newArray;
  
}

function magn(vector){
    
    if (vector.length == 2){
        return Math.pow(Math.pow(vector[0],2) + Math.pow(vector[1],2),0.5);
    } else if (vector.length == 3){
        return Math.pow(Math.pow(vector[0],2) + Math.pow(vector[1],2) + Math.pow(vector[2],2),0.5);
    }
   
}

function cross(u, v){
    
    return [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
    
}