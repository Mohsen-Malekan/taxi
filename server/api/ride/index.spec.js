'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var rideCtrlStub = {
  index: 'rideCtrl.index',
  show: 'rideCtrl.show',
  create: 'rideCtrl.create',
  upsert: 'rideCtrl.upsert',
  patch: 'rideCtrl.patch',
  destroy: 'rideCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var rideIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './ride.controller': rideCtrlStub
});

describe('Ride API Router:', function() {
  it('should return an express router instance', function() {
    expect(rideIndex).to.equal(routerStub);
  });

  describe('GET /api/rides', function() {
    it('should route to ride.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'rideCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/rides/:id', function() {
    it('should route to ride.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'rideCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/rides', function() {
    it('should route to ride.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'rideCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/rides/:id', function() {
    it('should route to ride.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'rideCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/rides/:id', function() {
    it('should route to ride.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'rideCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/rides/:id', function() {
    it('should route to ride.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'rideCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
