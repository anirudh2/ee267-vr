#include "OrientationMath.h"

/** TODO: see documentation in header file */
double computeAccPitch(double acc[3]) {
  double acc_norm = sqrt(sq(acc[0]) + sq(acc[1]) + sq(acc[2]));
  acc[0] /= acc_norm;
  acc[1] /= acc_norm;
  acc[2] /= acc_norm;
  if (acc[1] > 0) {
    return -(180/PI)*atan2(acc[2], sqrt(sq(acc[0])+sq(acc[1])));
  } else {
    return -(180/PI)*atan2(acc[2], -sqrt(sq(acc[0])+sq(acc[1])));
  }

}

/** TODO: see documentation in header file */
double computeAccRoll(double acc[3]) {

  double acc_norm = sqrt(sq(acc[0]) + sq(acc[1]) + sq(acc[2]));
  return -(180.0/PI)*atan2(-acc[0]/acc_norm,acc[1]/acc_norm);
  //return 0.0;

}

/** TODO: see documentation in header file */
double computeFlatlandRollGyr(double flatlandRollGyrPrev, double gyr[3], double deltaT) {
  return flatlandRollGyrPrev + gyr[2]*deltaT;
  //return 0.0;

}

/** TODO: see documentation in header file */
double computeFlatlandRollAcc(double acc[3]) {
  return atan2(acc[0], acc[1])*180/PI;
  //return 0.0;

}

/** TODO: see documentation in header file */
double computeFlatlandRollComp(double flatlandRollCompPrev, double gyr[3], double flatlandRollAcc, double deltaT, double alpha) {
  double gyrTerm = computeFlatlandRollGyr(flatlandRollCompPrev, gyr, deltaT);
  double accTerm = flatlandRollAcc;
  return alpha*gyrTerm + (1 - alpha)*accTerm;
  //return 0.0;

}


/** TODO: see documentation in header file */
void updateQuaternionGyr(Quaternion& q, double gyr[3], double deltaT) {
  // q is the previous quaternion estimate
  // update it to be the new quaternion estimate
  double norm_gyr = sqrt(sq(gyr[0])+sq(gyr[1])+sq(gyr[2]));

  if (norm_gyr < pow(10,-8))  {
    norm_gyr = 1;
  }

  Quaternion q_del = q.clone();
  q_del = q_del.setFromAngleAxis(deltaT*norm_gyr, gyr[0]/norm_gyr,gyr[1]/norm_gyr,gyr[2]/norm_gyr);
  q = q.multiply(q,q_del);
  q.normalize();
}


/** TODO: see documentation in header file */
void updateQuaternionComp(Quaternion& q, double gyr[3], double acc[3], double deltaT, double alpha) {
  // q is the previous quaternion estimate
  // update it to be the new quaternion estimate
  Quaternion q_new = q.clone();

  updateQuaternionGyr(q_new, gyr, deltaT);

  Quaternion q_accel(0, acc[0], acc[1], acc[2]);
  Quaternion q_accel_w = q_accel.rotate(q_new);
  q_accel_w.normalize();

  float phi = acos(q_accel_w.q[2])*180/PI;
  double n = sqrt(sq(-q_accel_w.q[3])+sq(q_accel_w.q[1]));
  double nx = -q_accel_w.q[3];/n;
  double nz = q_accel_w.q[1]/n;

  Quaternion tilt = q.setFromAngleAxis((1-alpha)*phi, nx, 0.0, nz);
  q = q.multiply(tilt, q_new);

}
