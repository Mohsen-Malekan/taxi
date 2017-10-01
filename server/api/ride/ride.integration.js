'use strict';

/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newRide;

describe('Ride API:', function() {
  describe('GET /api/rides', function() {
    var rides;

    beforeEach(function(done) {
      request(app)
        .get('/api/rides')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          rides = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(rides).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/rides', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/rides')
        .send({
          name: 'New Ride',
          info: 'This is the brand new ride!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newRide = res.body;
          done();
        });
    });

    it('should respond with the newly created ride', function() {
      expect(newRide.name).to.equal('New Ride');
      expect(newRide.info).to.equal('This is the brand new ride!!!');
    });
  });

  describe('GET /api/rides/:id', function() {
    var ride;

    beforeEach(function(done) {
      request(app)
        .get(`/api/rides/${newRide._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          ride = res.body;
          done();
        });
    });

    afterEach(function() {
      ride = {};
    });

    it('should respond with the requested ride', function() {
      expect(ride.name).to.equal('New Ride');
      expect(ride.info).to.equal('This is the brand new ride!!!');
    });
  });

  describe('PUT /api/rides/:id', function() {
    var updatedRide;

    beforeEach(function(done) {
      request(app)
        .put(`/api/rides/${newRide._id}`)
        .send({
          name: 'Updated Ride',
          info: 'This is the updated ride!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedRide = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedRide = {};
    });

    it('should respond with the updated ride', function() {
      expect(updatedRide.name).to.equal('Updated Ride');
      expect(updatedRide.info).to.equal('This is the updated ride!!!');
    });

    it('should respond with the updated ride on a subsequent GET', function(done) {
      request(app)
        .get(`/api/rides/${newRide._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let ride = res.body;

          expect(ride.name).to.equal('Updated Ride');
          expect(ride.info).to.equal('This is the updated ride!!!');

          done();
        });
    });
  });

  describe('PATCH /api/rides/:id', function() {
    var patchedRide;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/rides/${newRide._id}`)
        .send([
          {
            op: 'replace',
            path: '/name',
            value: 'Patched Ride'
          },
          {
            op: 'replace',
            path: '/info',
            value: 'This is the patched ride!!!'
          }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedRide = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedRide = {};
    });

    it('should respond with the patched ride', function() {
      expect(patchedRide.name).to.equal('Patched Ride');
      expect(patchedRide.info).to.equal('This is the patched ride!!!');
    });
  });

  describe('DELETE /api/rides/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/rides/${newRide._id}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when ride does not exist', function(done) {
      request(app)
        .delete(`/api/rides/${newRide._id}`)
        .expect(404)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });
  });
});
