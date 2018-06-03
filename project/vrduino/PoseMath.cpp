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
    //Serial.println((double)CLOCKS_PER_SECOND);
    //Serial.println((double)clockTicks[i]);
    double deltaT_h = (double)clockTicks[i]/(double)CLOCKS_PER_SECOND;
    //Serial.printf("%f\n",deltaT_h);
    double azimuth_angle = -deltaT_h*21600.0 + 90.0;
    double x = tan(azimuth_angle*PI/180.0);
    double deltaT_v = (double)clockTicks[i+1]/(double)CLOCKS_PER_SECOND;
    //Serial.printf("%f\n",deltaT_v);
    double elevation_angle = deltaT_v*21600.0 - 90.0;
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
  // Find the scale factor using Eq 12 in the notes and scale h
  double s = 2/( sqrt( sq(h[0])+sq(h[3])+sq(h[6]) ) + sqrt( sq(h[1]) + sq(h[4]) + sq(h[7]) ) );

  // Scale h by s
  Matrix.Scale( (double*)h, 8, 1, s );

  // Find tx, ty, and tz based on Eq 13
  pos3DOut[2] = -s;
  pos3DOut[1] = h[5];
  pos3DOut[0] = h[2];

  // Estimate the rotation matrix using Eq 14
   double r11 = h[0]/( sqrt( sq(h[0])+sq(h[3]+sq(h[6]) ) ) );
   double r21 = h[3]/( sqrt( sq(h[0])+sq(h[3]+sq(h[6]) ) ) );
   double r31 = h[6]/( sqrt( sq(h[0])+sq(h[3]+sq(h[6]) ) ) );

   // Estimate r2_tilde using Eq 15. Then make it unit length and orthogonal by dividing by its 2 norm
   double r12_tilde = h[1] - ( r11*( r11*h[1]+r21*h[4]+r31*h[7] ) );
   double r22_tilde = h[4] - ( r21*( r11*h[1]+r21*h[4]+r31*h[7] ) );
   double r32_tilde = -h[7] - ( r31*( r11*h[1]+r21*h[4]+r31*h[7] ) );

   double r12 = r12_tilde/( sqrt( sq(r12_tilde)+sq(r22_tilde)+sq(r32_tilde) ) );
   double r22 = r22_tilde/( sqrt( sq(r12_tilde)+sq(r22_tilde)+sq(r32_tilde) ) );
   double r32 = r32_tilde/( sqrt( sq(r12_tilde)+sq(r22_tilde)+sq(r32_tilde) ) );

   // Find r3 using Eq 16
   double r13 = r21*r32-r31*r22;
   double r23 = r31*r12-r11*r32;
   double r33 = r11*r22-r21*r12;

   // Assign to ROut
   ROut[0][0] = r11;
   ROut[0][1] = r12;
   ROut[0][2] = r13;
   ROut[1][0] = r21;
   ROut[1][1] = r22;
   ROut[1][2] = r23;
   ROut[2][0] = r31;
   ROut[2][1] = r32;
   ROut[2][2] = r33;
}



/**
 * TODO: see header file for documentation
 */
Quaternion getQuaternionFromRotationMatrix(double R[3][3]) {

  // Make unnormalized q estimation using Eq 39
  double qw_un = ( sqrt(1+R[0][0]+R[1][1]+R[3][3]) ) / 2;
  double qx_un = ( R[2][1]-R[1][2] ) / ( 4*qw_un );
  double qy_un = ( R[0][2]-R[2][0] ) / ( 4*qw_un );
  double qz_un = ( R[1][0]-R[0][1] ) / ( 4*qw_un );

  // Normalize and return
  double qw = qw_un / ( sqrt( sq(qw_un)+sq(qx_un)+sq(qy_un)+sq(qz_un) ) );
  double qx = qx_un / ( sqrt( sq(qw_un)+sq(qx_un)+sq(qy_un)+sq(qz_un) ) );
  double qy = qy_un / ( sqrt( sq(qw_un)+sq(qx_un)+sq(qy_un)+sq(qz_un) ) );
  double qz = qz_un / ( sqrt( sq(qw_un)+sq(qx_un)+sq(qy_un)+sq(qz_un) ) );
  return Quaternion(qw, qx, qy, qz);

}
