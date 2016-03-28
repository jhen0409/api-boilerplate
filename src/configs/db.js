const db = {
  host: process.env.DOCKER ? 'mongo' : 'localhost',
  port: 27017,
};

if (process.env.NODE_ENV === 'production') {
  Object.assign(db, { name: 'API' });
} else if (process.env.NODE_ENV === 'development') {
  Object.assign(db, { name: 'API_Dev' });
} else {  // test
  Object.assign(db, { name: 'API_Test' });
}

export default db;
