#include "TestPose.h"
#include "PoseMath.h"
#include "MatrixMath.h"

bool testPose1() {
  uint32_t clockTicks[8] = {299760,172100,110930,329410,116350,248650,213490,143460};
  double pos2D[8];
  convertTicksTo2DPositions(clockTicks,pos2D);
//  for (int i = 0; i < 8; i++) {
//    Serial.println(pos2D[i]);
//  }
  double posRef[8] = {-42.0,25.0,42.0,25.0,42.0,-25.0,-42.0,-25.0};
  double Aout[8][8];
  formA(pos2D,posRef,Aout);
  //Matrix.Print((double *)Aout,8,8,"TL's w");
  double hOut[8];
  if (solveForH(Aout,pos2D,hOut) == false) {
    Serial.print("false");
  }
  //Matrix.Print((double *)hOut,8,1,"TL's second w");
  double ROut[3][3];
  double pos3DOut[3];
  getRtFromH(hOut,ROut,pos3DOut);
  //Matrix.Print((double *)ROut,3,3,"TL's third w");
  //Matrix.Print((double *)pos3DOut,3,1,"TL's broken son");
  return true;

}

void testPoseMain() {

  Serial.printf("testing\n");
  testPose1();

}
