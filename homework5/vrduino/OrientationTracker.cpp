#include "OrientationTracker.h"

OrientationTracker::OrientationTracker(double imuFilterAlphaIn,  bool simulateImuIn) :

  imu(),
  gyr{0,0,0},
  acc{0,0,0},
  gyrBias{0,0,0},
  gyrVariance{0,0,0},
  accBias{0,0,0},
  accVariance{0,0,0},
  previousTimeImu(0),
  imuFilterAlpha(imuFilterAlphaIn),
  deltaT(0.0),
  simulateImu(simulateImuIn),
  simulateImuCounter(0),
  flatlandRollGyr(0),
  flatlandRollAcc(0),
  flatlandRollComp(0),
  quaternionGyr{1,0,0,0},
  eulerAcc{0,0,0},
  quaternionComp{1,0,0,0}

  {

}

void OrientationTracker::initImu() {
  imu.init();
}


/**
 * TODO: see documentation in header file
 */
void OrientationTracker::measureImuBiasVariance() {

  //check if imu.read() returns true
  //then read imu.gyrX, imu.accX, ...
  const int num_measurements = 1000;
  double gyrXData[num_measurements];
  double gyrYData[num_measurements];
  double gyrZData[num_measurements];
  double accXData[num_measurements];
  double accYData[num_measurements];
  double accZData[num_measurements];
  int i = 0;
  while (i < num_measurements) {
    if (imu.read() == true) {
      gyrXData[i] = imu.gyrX;
      gyrYData[i] = imu.gyrY;
      gyrZData[i] = imu.gyrZ;
      accXData[i] = imu.accX;
      accYData[i] = imu.accY;
      accZData[i] = imu.accZ;
      i++;
    }
  }

  //compute bias, variance.
  //update:
  //gyrBias[0], gyrBias[1], gyrBias[2]
  //gyrVariance[0], gyrBias[1], gyrBias[2]
  //accBias[0], accBias[1], accBias[2]
  //accVariance[0], accBias[1], accBias[2]
  for (int i = 0; i < num_measurements; i++) {
    gyrBias[0] += gyrXData[i];
    gyrBias[1] += gyrYData[i];
    gyrBias[2] += gyrZData[i];
    accBias[0] += accXData[i];
    accBias[1] += accYData[i];
    accBias[2] += accZData[i];
  }

  gyrBias[0] /= num_measurements;
  gyrBias[1] /= num_measurements;
  gyrBias[2] /= num_measurements;
  accBias[0] /= num_measurements;
  accBias[1] /= num_measurements;
  accBias[2] /= num_measurements;

  for (int i = 0; i < num_measurements; i++) {
    gyrVariance[0] += (gyrBias[0] - gyrXData[i])*(gyrBias[0] - gyrXData[i]);
    gyrVariance[1] += (gyrBias[1] - gyrYData[i])*(gyrBias[1] - gyrYData[i]);
    gyrVariance[2] += (gyrBias[2] - gyrZData[i])*(gyrBias[2] - gyrZData[i]);
    accVariance[0] += (accBias[0] - accXData[i])*(accBias[0] - accXData[i]);
    accVariance[1] += (accBias[1] - accYData[i])*(accBias[1] - accYData[i]);
    accVariance[2] += (accBias[2] - accZData[i])*(accBias[2] - accZData[i]);
  }

  gyrVariance[0] /= num_measurements;
  gyrVariance[1] /= num_measurements;
  gyrVariance[2] /= num_measurements;
  accVariance[0] /= num_measurements;
  accVariance[1] /= num_measurements;
  accVariance[2] /= num_measurements;

}

void OrientationTracker::setImuBias(double bias[3]) {

  for (int i = 0; i < 3; i++) {
    gyrBias[i] = bias[i];
  }

}

void OrientationTracker::resetOrientation() {

  flatlandRollGyr = 0;
  flatlandRollAcc = 0;
  flatlandRollComp = 0;
  quaternionGyr = Quaternion();
  eulerAcc[0] = 0;
  eulerAcc[1] = 0;
  eulerAcc[2] = 0;
  quaternionComp = Quaternion();

}

bool OrientationTracker::processImu() {

  if (simulateImu) {

    //get imu values from simulation
    updateImuVariablesFromSimulation();

  } else {

    //get imu values from actual sensor
    if (!updateImuVariables()) {

      //imu data not available
      return false;

    }

  }

  //run orientation tracking algorithms
  updateOrientation();

  return true;

}

void OrientationTracker::updateImuVariablesFromSimulation() {

    deltaT = 0.002;
    //get simulated imu values from external file
    for (int i = 0; i < 3; i++) {
      gyr[i] = imuData[simulateImuCounter + i];
    }
    simulateImuCounter += 3;
    for (int i = 0; i < 3; i++) {
      acc[i] = imuData[simulateImuCounter + i];
    }
    simulateImuCounter += 3;
    simulateImuCounter = simulateImuCounter % nImuSamples;

    //simulate delay
    delay(1);

}

/**
 * TODO: see documentation in header file
 */
bool OrientationTracker::updateImuVariables() {

  //sample imu values
  if (!imu.read()) {
  // return false if there's no data
    return false;
  }

  const int us_per_s = 1000000;
  //call micros() to get current time in microseconds
  float currTime = micros();
  float currentTimeImu = currTime / us_per_s;
  //update:
  //previousTimeImu (in seconds)
  //deltaT (in seconds)
  deltaT = currentTimeImu - previousTimeImu;
  previousTimeImu = currentTimeImu;

  //read imu.gyrX, imu.accX ...
  //update:
  //gyr[0], ...
  //acc[0], ...
  gyr[0] = imu.gyrX - gyrBias[0];
  gyr[1] = imu.gyrY - gyrBias[1];
  gyr[2] = imu.gyrZ - gyrBias[2];
  acc[0] = imu.accX;
  acc[1] = imu.accY;
  acc[2] = imu.accZ;

  return true;

}


/**
 * TODO: see documentation in header file
 */
void OrientationTracker::updateOrientation() {

  //call functions in OrientationMath.cpp.
  //use only class variables as arguments to functions.

  //update:
  //flatlandRollGyr
  flatlandRollGyr = computeFlatlandRollGyr(flatlandRollGyr, gyr, deltaT);
  //flatlandRollAcc
  flatlandRollAcc = computeFlatlandRollAcc(acc);
  //flatlandRollComp
  flatlandRollComp = computeFlatlandRollComp(flatlandRollComp, gyr, flatlandRollAcc, deltaT, imuFilterAlpha);
  //quaternionGyr
  quaternionGyr = updateQuaternionGyr(quaternionGyr, gyr, deltaT);
  //eulerAcc
  // eulerAcc = 
  //quaternionComp
  quaternionComp = updateQuaternionComp(quaternionComp, gyr, eulerAcc, deltaT, imuFilterAlpha);




}
