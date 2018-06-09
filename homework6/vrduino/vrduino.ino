
#include <Wire.h>
#include "OrientationTracker.h"
#include "TestOrientation.h"

//complementary filter value [0,1].
//1: ignore acc tilt, 0: use all acc tilt
double alphaImuFilter = 0;

//if true, get imu values from recorded data in external file
//if false, get imu values from live sampling.
bool simulateImu = false;

//if test is true, then run tests in TestOrientation.cpp and exit
bool test = false;

//if measureImuBias is true, measure imu bias and variance
bool measureImuBias = true;

//if measureBias is false, set the imu bias to the following:
double gyrBiasSet[3] = {0.17408, -0.19935, 0.44581};

//intialize orientation tracker
OrientationTracker tracker(alphaImuFilter, simulateImu);

//stream mode
//To change what the Teensy is printing out, set streamMode
//to one of the following values.
//You can change the streamMode in real time by sending the
//corresponding number to the Teensy through the Serial Monitor.

//bias values, read frequency
const int INFO   = 0;

//flatland roll
const int FLAT   = 1;

//full 3D orientation in quaternion (gyro),
//and euler angles (acc), quaternion (comp filter)
const int THREED = 2;

//gyro values after bias subtraction
const int GYR    = 3;

//acc values
const int ACC    = 4;

//quaternion from comp filter
const int QC     = 5;

//COMBINED
const int COMB = 10;

//chose which values you want to stream
int streamMode = COMB; //FLAT

//variables to measure read frequency
int nReads = 0;
unsigned long prevTime = 0;

//runs when the Teensy is powered on
void setup() {

  Serial.begin(115200);


  if (test) {

    delay(300);//delay(2000);
    testMain();
    return;

  }

  tracker.initImu();

  if (measureImuBias) {

    Serial.printf("Measuring bias\n");
    tracker.measureImuBiasVariance();

  } else {

    tracker.setImuBias(gyrBiasSet);

  }

  prevTime = micros();

}

void loop() {

  //reads in a single char to update behaviour. options:
  //0-5: set streamMode. See mapping above.
  //r  : reset orientation estimates to 0.
  //b  : remeasure bias
  if (Serial.available()) {

    int read = Serial.read();

    //check for streamMode
    int modeRead = read - 48;

    if (modeRead >= 0 && modeRead <= 5) {

      streamMode = modeRead;

    } else  if (read == 'r') {

      //reset orientation estimate to 0
      tracker.resetOrientation();

    } else if (read == 'b') {

      //measure imu bias
      Serial.printf("Measuring bias\n");
      tracker.measureImuBiasVariance();

    }
  }

  if (test) {
    return;
  }

  if (streamMode == INFO) {
    //print out number of reads / sec
    unsigned long now = micros();
    if ((now - prevTime) > 1000000) {
      Serial.printf("nReads/sec: %d\n", nReads);
      nReads = 0;
      prevTime = now;

      //print out bias/variance
      const double* gyrBias = tracker.getGyrBias();
      const double* gyrVariance = tracker.getGyrVariance();
      Serial.printf("GYR_BIAS: %.5f %.5f %.5f\n", gyrBias[0], gyrBias[1], gyrBias[2]);
      Serial.printf("GYR_VAR: %.5f %.5f %.5f\n", gyrVariance[0], gyrVariance[1], gyrVariance[2]);

      const double* accBias = tracker.getAccBias();
      const double* accVariance = tracker.getAccVariance();
      Serial.printf("ACC_BIAS: %.5f %.5f %.5f\n", accBias[0], accBias[1], accBias[2]);
      Serial.printf("ACC_VAR: %.5f %.5f %.5f\n", accVariance[0], accVariance[1], accVariance[2]);

    }
  }

  bool imuTrack = tracker.processImu();

  //return if there's no new values
  if (!imuTrack) {
    return;
  }

  nReads++;

  //get relevant values from the tracker class
  double flatlandRollGyr = tracker.getFlatLandRollGyr();
  double flatlandRollAcc = tracker.getFlatLandRollAcc();
  double flatlandRollComp = tracker.getFlatLandRollComp();
  const double* acc = tracker.getAcc();
  const double* gyr = tracker.getGyr();
  const Quaternion& qGyr = tracker.getQuaternionGyr();
  const double* eulerAcc = tracker.getEulerAcc();
  const Quaternion& qComp = tracker.getQuaternionComp();

  if (streamMode == FLAT) {

    //print out flatland roll
    Serial.printf("FB %.3f %.3f %.3f\n",
      flatlandRollGyr, flatlandRollAcc, flatlandRollComp);

  } else if (streamMode == THREED) {

    //quat values from gyro
    Serial.printf("QG %.3f %.3f %.3f %.3f\n",
      qGyr.q[0], qGyr.q[1], qGyr.q[2], qGyr.q[3]);

    //euler values from acc
    Serial.printf("EA %.3f %.3f %.3f\n",
      eulerAcc[0], eulerAcc[1], eulerAcc[2]);

    //quat values from comp filter
    Serial.printf("QC %.3f %.3f %.3f %.3f\n",
      qComp.q[0], qComp.q[1], qComp.q[2], qComp.q[3]);

  } else if (streamMode == GYR) {

    //print out gyr values
    Serial.printf("GYR: %.3f %.3f %.3f\n",
      gyr[0], gyr[1], gyr[2]);

  } else if (streamMode == ACC) {

    //print out acc values
    Serial.printf("ACC: %.3f %.3f %.3f\n",
      acc[0], acc[1], acc[2]);

  } else if (streamMode == COMB) {

    //print out acc values
    Serial.printf("CO %.3f %.3f\n",
      flatlandRollGyr, acc[2]);

  } else if (streamMode == QC) {

    //just print out comp filter
    Serial.printf("QC %.3f %.3f %.3f %.3f\n",
      qComp.q[0], qComp.q[1], qComp.q[2], qComp.q[3]);

  }


}








///**
// *  This is the main file for pose tracking with the VRduino.
// */
//
//#include <Wire.h>
//#include "TestPose.h"
//#include "PoseTracker.h"
//#include "InputCapture.h"
//
//int myVariable = 1;
//
////complementary filter value [0,1].
////1: ignore acc tilt, 0: use all acc tilt
//double alphaImuFilter = 0.99;
//
////get simulated lighthouse timings (to test without physical lighthouse)
//bool simulateLighthouse = false;
//
////if test is true, then run tests in TestPose.cpp and exit
//bool test = false;
//
////mode of base station
////0:A, 1:B, 2: C
//const int A = 0;
//const int B = 1;
//const int C = 2;
//int baseStationMode = B;
//
////if true, measure the imu bias on start
//bool measureImuBias = false;
//
////if measureImuBias is false, set the imu bias to the following
//double imuBias[3] = {0, 0, 0};
//
//PoseTracker tracker(alphaImuFilter, baseStationMode, simulateLighthouse);
//
//void setup() {
//
//  Serial.begin(115200);
//  if (test) {
//
//    delay(500);
//    testPoseMain();
//    return;
//
//  }
//
//  tracker.initImu();
//
//  if (measureImuBias) {
//
//    tracker.measureImuBiasVariance();
//
//  } else {
//
//    tracker.setImuBias(imuBias);
//
//  }
//
//}
//
//void loop() {
//
//  if (test) {
//
//    return;
//
//  }
//
//  if (Serial.available()) {
//
//    int byteRead = Serial.read();
//    int desiredMode  = byteRead - 48;
//
//    if (desiredMode >= 0 && desiredMode <= 2) {
//
//      tracker.setMode(desiredMode);
//
//    } else if (byteRead == 'r') {
//
//      //reset orientation tracking
//      tracker.resetOrientation();
//
//    } else if (byteRead == 'b') {
//
//      //remeasure bias
//      tracker.measureImuBiasVariance();
//
//    }
//
//  }
//
//
//  //variables determining the success of imu and lighthouse tracking
//  bool imuTrack = false;
//  int hmTrack = -2;
//
//  imuTrack = tracker.processImu();
//  hmTrack = tracker.processLighthouse();
//
//  //get values from tracker
//  double pitch = tracker.getBaseStationPitch();
//  double roll = tracker.getBaseStationRoll();
//  int mode = tracker.getBaseStationMode();
//  const unsigned long * numPulseDetections = tracker.getNumPulseDetections();
//  const double * position = tracker.getPosition();
//  const double * position2D = tracker.getPosition2D();
//  const Quaternion& quaternionComp = tracker.getQuaternionComp();
//  const Quaternion& quaternionHm = tracker.getQuaternionHm();
//
//  if (hmTrack > -2) {
//    // base station data available
//
//    //print base station data
//    Serial.printf("BS ");
//    Serial.printf("%.3f %.3f %d\n", pitch, roll, mode);
//
//    // print num sweep pulse detections for each axis of each photodiode
//    // order is sensor0x, sensor0y, ... sensor3x, sensor3y
//    // should normally be 1 1 1 1 1 1 1 1
//    // could be more than 2 if there are inter-reflections,
//    // or 0 if there are occlusions
//    Serial.printf("NP ");
//    for (int i = 0; i < 8; i++) {
//      Serial.printf("%lu ", numPulseDetections[i]);
//    }
//    Serial.println();
//
//  }
//
//  if (hmTrack == 1 ) {
//
//    //print xyz position
//    Serial.printf("PS %.3f %.3f %.3f\n",
//      position[0], position[1], position[2]);
//
//    //print quaternion from homography
//    Serial.printf("QH %.3f %.3f %.3f %.3f\n",
//      quaternionHm.q[0], quaternionHm.q[1],
//      quaternionHm.q[2], quaternionHm.q[3]);
//
//    //print 2D positions of photodiodes for visualization
//    Serial.printf("PD ");
//    for (int i = 0; i < 8; i++) {
//      Serial.printf("%.3f ", position2D[i]);
//    }
//    Serial.println();
//
//  }
//
////  if (imuTrack == 1) {
////
////  //print quaternion from imu
////    Serial.printf("QC %.3f %.3f %.3f %.3f\n",
////      quaternionComp.q[0], quaternionComp.q[1],
////      quaternionComp.q[2], quaternionComp.q[3]);
////
////  }
//
//    if (myVariable == 1) {
//      Serial.printf("FL %.3f\n", computeFlatlandRollComp());
//    }
//    }
//
//}
