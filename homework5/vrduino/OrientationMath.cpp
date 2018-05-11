#include "OrientationMath.h"

/** TODO: see documentation in header file */
double computeAccPitch(double acc[3]) {

  double acc_pitch;
  if (acc[1] > 0) {
    acc_pitch = -(180.0/PI)*atan2(acc[3], sqrt(sq(acc[0])+sq(acc[1])));
  } else {
    acc_pitch = -(180.0/PI)*atan2(acc[3], -sqrt(sq(acc[0])+sq(acc[1])));
  }

  return acc_pitch;
}

/** TODO: see documentation in header file */
double computeAccRoll(double acc[3]) {

  return -(180.0/PI)*atan2(acc[0],acc[1]);

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
}
