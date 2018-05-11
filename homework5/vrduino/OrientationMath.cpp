#include "OrientationMath.h"

/** TODO: see documentation in header file */
double computeAccPitch(double acc[3]) {
  double acc_pitch;
  double acc_norm = sqrt(sq(acc[0]) + sq(acc[1]) + sq(acc[2]));
  if (acc[1] > 0) {
    acc_pitch = -(180/PI)*atan2(acc[2]/acc_norm, sqrt(sq(acc[0]/acc_norm)+sq(acc[1]/acc_norm)));
  } else {
    acc_pitch = -(180/PI)*atan2(acc[2]/acc_norm, -sqrt(sq(acc[0]/acc_norm)+sq(acc[1]/acc_norm)));
  }

  return acc_pitch;
}

/** TODO: see documentation in header file */
double computeAccRoll(double acc[3]) {

  double acc_norm = sqrt(sq(acc[0]) + sq(acc[1]) + sq(acc[2]));
  return -(180.0/PI)*atan2(acc[0]/acc_norm,acc[1]/acc_norm);
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

  if (norm_gyr > 1e-8)  {
    gyr[0] = gyr[0]/norm_gyr;
    gyr[1] = gyr[1]/norm_gyr;
    gyr[2] = gyr[2]/norm_gyr;
  }

  q = Quaternion().multiply(q,Quaternion().setFromAngleAxis(deltaT*norm_gyr, gyr[0],gyr[1],gyr[2]));
  q.normalize();
}


/** TODO: see documentation in header file */
void updateQuaternionComp(Quaternion& q, double gyr[3], double acc[3], double deltaT, double alpha) {
  // q is the previous quaternion estimate
  // update it to be the new quaternion estimate
  Quaternion q_new = q.clone();

  updateQuaternionGyr(q_new, gyr, deltaT);

  Quaternion q_accel = Quaternion(0.0, acc[0], acc[1], acc[2]);
  Quaternion q_accel_w = q_accel.rotate(q_new);
  q_accel_w.normalize();

  double phi = acos(q_accel_w.q[2])*180.0/PI;
  double nx = -q_accel_w.q[3];
  double nz = q_accel_w.q[1];
  double n = sqrt(sq(nx)+sq(nz));
  nx /= n;
  nz /= n;

  Quaternion tilt = q.setFromAngleAxis((1-alpha)*phi, nx, 0.0, nz);
  q = q.multiply(tilt, q_new);

}
