#include "OrientationMath.h"

/** TODO: see documentation in header file */
double computeAccPitch(double acc[3]) {
  double acc_pitch;
  double acc_norm = sqrt(sq(acc[0]) + sq(acc[1]) + sq(acc[2]));
  if (acc[1] > 0) {
    acc_pitch = -(180.0/PI)*atan2(acc[2]/acc_norm, sqrt(sq(acc[0])+sq(acc[1])));
  } else {
    acc_pitch = -(180.0/PI)*atan2(acc[2]/acc_norm, -sqrt(sq(acc[0])+sq(acc[1])));
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
  double norm_gyr = sqrt(sq(gyr[0])+sq(gyr[1])+sq(gyr[2]));

  if (norm_gyr > 1e-8)  {
    gyr[0] = gyr[0]/norm_gyr;
    gyr[1] = gyr[1]/norm_gyr;
    gyr[2] = gyr[2]/norm_gyr;
  }

  q = Quaternion().multiply(q,Quaternion().setFromAngleAxis(deltaT*norm_gyr, gyr[0],gyr[1],gyr[2]));
  q.normalize();

  Quaternion q_acc = Quaternion(0, acc[0], acc[1], acc[2]);
  Quaternion q_rot = q_acc.rotate(q);

  q_rot.normalize();

  double accel = (180.0/PI)*acos(q_rot.q[2]/q_rot.length());
  double x_tilt = -q_rot.q[3]/sqrt(sq(q_rot.q[1]) + sq(q_rot.q[3]));
  double z_tilt = -q_rot.q[1]/sqrt(sq(q_rot.q[1]) + sq(q_rot.q[3]));
  Quaternion tilt = Quaternion().setFromAngleAxis((1-alpha)*accel, x_tilt, 0.0, z_tilt);
  tilt.normalize();
  q = Quaternion().multiply(tilt, q);
  q.normalize();
}
