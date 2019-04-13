/* eslint-env mocha */
const sommus = require('./index');
const {HttpError} = sommus;
const {expect} = require('chai');

describe('Testing index.js', () => {
  it('should instantiate', () => {
    expect(sommus).to.exist;
  });

  it('should have proper HttpError', () => {
    expect(HttpError).to.be.a('function');
  });

  it('should create HttpError using new', () => {
    const error = new HttpError(404, 'blah');
    expect(error).to.be.an.instanceOf(HttpError);
    expect(error.status).to.equal(404);
    expect(error.results).to.equal('blah');
    expect(error.headers).to.eql({});
  });

  it('should create HttpError using new with no params', () => {
    const error = new HttpError();
    expect(error).to.be.an.instanceOf(HttpError);
    expect(error.status).to.equal(500);
    expect(error.results).to.equal('');
    expect(error.headers).to.eql({});
  });

  it('should create HttpError using new with only results', () => {
    const error = new HttpError('dogs');
    expect(error).to.be.an.instanceOf(HttpError);
    expect(error.status).to.equal(500);
    expect(error.results).to.equal('dogs');
    expect(error.headers).to.eql({});
  });

  it('should create HttpError using fn-call', () => {
    const error = HttpError(302, null,  {location:'/dogs'});
    expect(error).to.be.an.instanceOf(HttpError);
    expect(error.status).to.equal(302);
    expect(error.results).to.equal('');
    expect(error.headers).to.eql({location:'/dogs'});
  });
});
