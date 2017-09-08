'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var favoriteCtrlStub = {
  index: 'favoriteCtrl.index',
  show: 'favoriteCtrl.show',
  create: 'favoriteCtrl.create',
  upsert: 'favoriteCtrl.upsert',
  patch: 'favoriteCtrl.patch',
  destroy: 'favoriteCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var favoriteIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './favorite.controller': favoriteCtrlStub
});

describe('Favorite API Router:', function() {
  it('should return an express router instance', function() {
    expect(favoriteIndex).to.equal(routerStub);
  });

  describe('GET /api/favorites', function() {
    it('should route to favorite.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'favoriteCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/favorites/:id', function() {
    it('should route to favorite.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'favoriteCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/favorites', function() {
    it('should route to favorite.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'favoriteCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/favorites/:id', function() {
    it('should route to favorite.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'favoriteCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/favorites/:id', function() {
    it('should route to favorite.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'favoriteCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/favorites/:id', function() {
    it('should route to favorite.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'favoriteCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
