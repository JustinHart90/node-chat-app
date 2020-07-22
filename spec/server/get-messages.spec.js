const request = require('request');
const routes = require('../support/routes');

describe('get messages', () => {
    it('should return 200 OK', (done) => {
        request.get(routes.messages, (err, res) => {
            expect(res.statusCode).toEqual(200);
            done();
        });
    });
    
    it('should return a list that is not empty', (done) => {
        request.get(routes.messages, (err, res) => {
            expect(JSON.parse(res.body).length).toBeGreaterThan(0);
            done();
        });
    });
});