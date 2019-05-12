import RadixAPI from '../src/radixApi';
import assert from 'assert';
import key from '../key.json';


describe('RadixAPI', async () => {
  const initialData: any = {
    withId: {
      id: 'nope'
    },
    empty: {},
    simple: {
      data: 'some data'
    },
    long: {
      data: new Array(1000).fill('x').join('')
    },
    veryLong: {
      data: new Array(10000).fill('x').join('')
    }
  };
  let radixApi: RadixAPI;
  const ids: any = {};
  const returnedData: any = {};


  before(function (done) {
    this.timeout(10000);
    radixApi = new RadixAPI('dd-test', 'dd');
    radixApi.initialize(key, process.env.KEY_PASSWORD as string);
    setTimeout(() => done(), 8000);
  });



  it('submitData() should not allow for given data to have an ID property', () => {
    return assert.rejects(radixApi.submitData(initialData.withId));
  });

  ['empty', 'simple', 'long', 'veryLong'].forEach(x => {
    describe(`for ${x} data (${Buffer.byteLength(JSON.stringify(initialData[x]))} Bytes)`, () => {


      describe('submitData()', () => {
        it('should return a string', async function () {
          this.timeout(10000);
          ids[x] = await radixApi.submitData(initialData[x]);
          assert.strictEqual(typeof ids[x], 'string');
        });

        it('should return a 21 char long string', () => {
          assert.strictEqual(ids[x].length, 21);
        });
      });


      describe('getData()', () => {
        it('should return an object', async () => {
          returnedData[x] = await radixApi.getDataById(ids[x]);
          assert.strictEqual(typeof returnedData[x], 'object');
        });

        it('should return an object with id', () => {
          assert.strictEqual(!!returnedData[x].id, true);
        });

        it('should return an object with the same ID that submitData() returned', () => {
          assert.strictEqual(returnedData[x].id, ids[x]);
        });

        it('should return an object with the same data as original data', () => {
          const data = { ...returnedData[x] };
          delete data.id;
          assert.strictEqual(JSON.stringify(data), JSON.stringify(initialData[x]));
        });
      });
    })

  });

  after(() => {
    process.exit(0);
  });
});
