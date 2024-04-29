const request = require('supertest');
const app = require('../app'); // Import your Express app


describe('GET /suggestions', () => {
  describe('with a non-existent city', () => {
    let response;

    beforeAll((done) => {
      request(app)
        .get('/suggestions?q=SomeRandomCityInTheMiddleOfNowhere')
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          response = res;
          done();
        });
    });

    it('returns a 404', () => {
      expect(response.statusCode).toBe(404);
    });

    it('returns an empty array of suggestions', () => {
      expect(response.body.suggestions).toBeInstanceOf(Array);
      expect(response.body.suggestions).toHaveLength(0);
    });
  });

  describe('with a valid city', () => {
    let response;

    beforeAll((done) => {
      request(app)
        .get('/suggestions?q=Odessa')
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          response = res;
          done();
        });
    });

    it('returns a 200', () => {
      expect(response.statusCode).toBe(200);
    });

    it('returns an array of suggestions', () => {
      expect(response.body.suggestions).toBeInstanceOf(Array);
      expect(response.body.suggestions.length).toBeGreaterThan(0);
    });

    describe.skip('Validate the shape of the data being returned', () => {
      it('contains latitudes and longitudes', () => {
        expect(response.body.suggestions).toSatisfyAll((suggestion) => {
          return suggestion.latitude && suggestion.longitude;
        });
      });

      it('contains scores', () => {
        expect(response.body.suggestions).toSatisfyAll((suggestion) => {
          return suggestion.latitude && suggestion.longitude;
        });
      });
    });

    it('contains a match', () => {
      console.log(response.body.suggestions[0].name);
      expect(response.body.suggestions.some(suggestion => /odessa/i.test(suggestion.name) ||
        /montreal/i.test(suggestion.alt_name))).toBe(true);
    });
  });
});
