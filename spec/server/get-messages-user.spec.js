const request = require('request');
const routes = require('../support/routes');

const testName = 'timmy';
const url = routes.messages + testName;

function createTestObject(testName) {
    const message = {name: testName, message: 'Hey!'};
    request.post(routes.message, {form: message}, (err, res) => {
        console.log(res.body);
    });
}

createTestObject(testName);

describe('get messages from user', () => {

    it('should return 200 OK', (done) => {
        request.get(url, (err, res) => {
            expect(res.statusCode).toEqual(200);
            done();
        });
    });

    it('name should be ' + testName, (done) => {
        request.get(url, (err, res) => {
            expect(JSON.parse(res.body)[0].name).toEqual(testName);
            done();
        });
    });

});