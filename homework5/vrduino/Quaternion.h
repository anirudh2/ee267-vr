/**
 * Quaternion class
 *
 * We are using C++! Not JavaScript!
 * Unlike JavaScript, "this" keyword is representing a pointer!
 * If you want to access the member variable q[0], you should write
 * this->q[0].
 *
 * @copyright The Board of Trustees of the Leland Stanford Junior University
 * @version 2018/03/28
 */

#ifndef QUATERNION_H
#define QUATERNION_H

#include "Arduino.h"

class Quaternion {
public:

  /***
   * public member variables to hold the values
   *
   * Definition:
   * q = q[0] + q[1] * i + q[2] * j + q[3] * k
   */
  double q[4];


  /* Default constructor */
  Quaternion() :
    q{1.0, 0.0, 0.0, 0.0} {}


  /* Cunstructor with some inputs */
  Quaternion(double q0, double q1, double q2, double q3) :
    q{q0, q1, q2, q3} {}


  /* function to create another quaternion with the same values. */
  Quaternion clone() {

    return Quaternion(this->q[0], this->q[1], this->q[2], this->q[3]);

  }

  /* function to construct a quaternion from angle-axis representation. angle is given in degrees. */
  Quaternion& setFromAngleAxis(double angle, double vx, double vy, double vz) {
    double deg2rad = PI/180.0;
    Quaternion q = Quaternion(cos(deg2rad*angle/2), vx*sin(deg2rad*angle/2), vy*sin(deg2rad*angle/2), vz*sin(deg2rad*angle/2));
    *this = q;
    return *this;

  }

  /* function to compute the length of a quaternion */
  double length() {

    return sqrt((this->q[0])*(this->q[0])+(this->q[1])*(this->q[1])+
      (this->q[2])*(this->q[2])+(this->q[3])*(this->q[3]));
  }

  /* function to normalize a quaternion */
  Quaternion& normalize() {

    double l = length();
    Quaternion q = Quaternion((this->q[0])/l, (this->q[1])/l, (this->q[2])/l, (this->q[3])/l);
    *this = q;
    return *this;
  }

  /* function to invert a quaternion */
  Quaternion& inverse() {

    double l2 = length()*length();
    Quaternion q = Quaternion((this->q[0])/l2, -(this->q[1])/l2, -(this->q[2])/l2, -(this->q[3])/l2);
    *this = q;
    Quaternion& q_reference = q;
    return q_reference;
  }

  /* function to multiply two quaternions */
  Quaternion multiply(Quaternion& a, Quaternion& b) {

    return Quaternion(a.q[0]*b.q[0]-a.q[1]*b.q[1]-a.q[2]*b.q[2]-a.q[3]*b.q[3],
                     a.q[0]*b.q[1]+a.q[1]*b.q[0]+a.q[2]*b.q[3]-a.q[3]*b.q[2],
                     a.q[0]*b.q[2]-a.q[1]*b.q[3]+a.q[2]*b.q[0]+a.q[3]*b.q[1],
                     a.q[0]*b.q[3]+a.q[1]*b.q[2]-a.q[2]*b.q[1]+a.q[3]*b.q[0]);
  }

  /* function to rotate a quaternion by r * q * r^{-1} */
  Quaternion rotate(Quaternion& r) {
    Quaternion q1 = Quaternion().multiply( r, *this );
    r.inverse(); Quaternion r_inv = r.clone(); r.inverse();
    Quaternion q2 = Quaternion().multiply( q1, r_inv );
    return q2;
  }


  /* helper function to print out a quaternion */
  void serialPrint() {
    Serial.print(q[0]);
    Serial.print(" ");
    Serial.print(q[1]);
    Serial.print(" ");
    Serial.print(q[2]);
    Serial.print(" ");
    Serial.print(q[3]);
    Serial.println();
  }
};

#endif // ifndef QUATERNION_H
