#include "PoseMath.h"

/**
 * TODO: see header file for documentation
 */
void convertTicksTo2DPositions(uint32_t clockTicks[8], double pos2D[8])
{
  //use variable CLOCKS_PER_SECOND defined in PoseMath.h
  //for number of clock ticks a second
  for (int i = 0; i < 8; i += 2)
  {
    double deltaT_h = clockTicks[i]/CLOCKS_PER_SECOND;
    double azimuth_angle = -deltaT_h/((1.0/60.0)/360.0) + (360.0/4.0);
    double x = tan(azimuth_angle*PI/180.0);
    double deltaT_v = clockTicks[i+1]/CLOCKS_PER_SECOND;
    double elevation_angle = deltaT_v/((1.0/60.0)/360.0) - (360.0/4.0);
    double y = tan(elevation_angle*PI/180.0);
    pos2D[i] = x;
    pos2D[i+1] = y;
  }
}

/**
 * TODO: see header file for documentation
 */
void formA(double pos2D[8], double posRef[8], double Aout[8][8]) {

//  for (int i = 0; i < 8; i += 2) {
//    Aout[i] = {posRef[i],posRef[i+1],1,0,0,0,-posRef[i]*pos2D[i],-posRef[i+1]*pos2D[i]};
//    Aout[i+1] = {0,0,0,posRef[i],posRef[i+1],1,-posRef[i]*pos2D[i+1],-posRef[i+1]*pos2D[i+1]};
//  }

for (int i = 0; i < 8; i += 2) {
//    Aout[i] = {posRef[i],posRef[i+1],1,0,0,0,-posRef[i]*pos2D[i],-posRef[i+1]*pos2D[i]};
//    Aout[i+1] = {0,0,0,posRef[i],posRef[i+1],1,-posRef[i]*pos2D[i+1],-posRef[i+1]*pos2D[i+1]};
      Aout[i][0] = posRef[i];
      Aout[i][1] = posRef[i+1];
      Aout[i][2] = 1;
      Aout[i][3] = 0;
      Aout[i][4] = 0;
      Aout[i][5] = 0;
      Aout[i][6] = -posRef[i]*pos2D[i];
      Aout[i][7] = -posRef[i+1]*pos2D[i];
      Aout[i+1][0] = 0;
      Aout[i+1][1] = 0;
      Aout[i+1][2] = 0;
      Aout[i+1][3] = posRef[i];
      Aout[i+1][4] = posRef[i+1];
      Aout[i+1][5] = 1;
      Aout[i+1][6] = -posRef[i]*pos2D[i+1];
      Aout[i+1][7] = -posRef[i+1]*pos2D[i+1];
}

}


/**
 * TODO: see header file for documentation
 */
bool solveForH(double A[8][8], double b[8], double hOut[8]) {
  //use Matrix Math library for matrix operations
  //example:
  //int inv = Matrix.Invert((double*)A, 8);
  //if inverse fails (Invert returns 0), return false 

  int InversionSuccess = Matrix.Invert((double*)A, 8);
  if (InversionSuccess == 0) {
    return false;
  }
  Matrix.Multiply((double*)A,b,8,8,1,hOut);
  return true;

}


/**
 * TODO: see header file for documentation
 */
void getRtFromH(double h[8], double ROut[3][3], double pos3DOut[3]) {


}



/**
 * TODO: see header file for documentation
 */
Quaternion getQuaternionFromRotationMatrix(double R[3][3]) {

  return Quaternion();

}
