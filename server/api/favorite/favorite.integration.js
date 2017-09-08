'use strict';

/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newFavorite;

describe('Favorite API:', function() {
  describe('GET /api/favorites', function() {
    var favorites;

    beforeEach(function(done) {
      request(app)
        .get('/api/favorites')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          favorites = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(favorites).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/favorites', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/favorites')
        .send({
          name: 'New Favorite',
          info: 'This is the brand new favorite!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newFavorite = res.body;
          done();
        });
    });

    it('should respond with the newly created favorite', function() {
      expect(newFavorite.name).to.equal('New Favorite');
      expect(newFavorite.info).to.equal('This is the brand new favorite!!!');
    });
  });

  describe('GET /api/favorites/:id', function() {
    var favorite;

    beforeEach(function(done) {
      request(app)
        .get(`/api/favorites/${newFavorite._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          favorite = res.body;
          done();
        });
    });

    afterEach(function() {
      favorite = {};
    });

    it('should respond with the requested favorite', function() {
      expect(favorite.name).to.equal('New Favorite');
      expect(favorite.info).to.equal('This is the brand new favorite!!!');
    });
  });

  describe('PUT /api/favorites/:id', function() {
    var updatedFavorite;

    beforeEach(function(done) {
      request(app)
        .put(`/api/favorites/${newFavorite._id}`)
        .send({
          name: 'Updated Favorite',
          info: 'This is the updated favorite!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedFavorite = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedFavorite = {};
    });

    it('should respond with the updated favorite', function() {
      expect(updatedFavorite.name).to.equal('Updated Favorite');
      expect(updatedFavorite.info).to.equal('This is the updated favorite!!!');
    });

    it('should respond with the updated favorite on a subsequent GET', function(done) {
      request(app)
        .get(`/api/favorites/${newFavorite._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let favorite = res.body;

          expect(favorite.name).to.equal('Updated Favorite');
          expect(favorite.info).to.equal('This is the updated favorite!!!');

          done();
        });
    });
  });

  describe('PATCH /api/favorites/:id', function() {
    var patchedFavorite;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/favorites/${newFavorite._id}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched Favorite' },
          { op: 'replace', path: '/info', value: 'This is the patched favorite!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedFavorite = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedFavorite = {};
    });

    it('should respond with the patched favorite', function() {
      expect(patchedFavorite.name).to.equal('Patched Favorite');
      expect(patchedFavorite.info).to.equal('This is the patched favorite!!!');
    });
  });

  describe('DELETE /api/favorites/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/favorites/${newFavorite._id}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when favorite does not exist', function(done) {
      request(app)
        .delete(`/api/favorites/${newFavorite._id}`)
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
