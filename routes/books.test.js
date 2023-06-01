// process.env.NODE_ENV = "test";

// const request = require("supertest");
// const { response } = require("../app.js");

// const app = require("../app.js");
// const db = require("../db.js");

// let testBooks;

// beforeEach(async function () {
  
// });
// describe('POST /books', function(){
//     test('Adding a book to the database', async function (){
//         const postedResponse = await request(app).post('/books').send({
//             "isbn": "0691161518",
//             "amazon_url": "http://a.co/eobPtX2",
//             "author": "Matthew Lane",
//             "language": "english",
//             "pages": 264,
//             "publisher": "Princeton University Press",
//             "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
//             "year": 2017
//         })

//         expect(response.statusCode).toBe(200)
//         expect(postedResponse.rows).toEqual({
//             "isbn": "0691161518",
//             "amazon_url": "http://a.co/eobPtX2",
//             "author": "Matthew Lane",
//             "language": "english",
//             "pages": 264,
//             "publisher": "Princeton University Press",
//             "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
//             "year": 2017
//         })
//     })
// })


// describe("GET /books", function () {
//   test("Gets a list of all books", async function () {
//     const response = await request(app).get(`/books`);
//     expect(response.statusCode).toEqual(200);
//     // expect(response.body).toEqual({
//     //     "books": [
//     //       {
//     //         "isbn": "0691161518",
//     //         "amazon_url": null,
//     //         "author": "Matthew Lane",
//     //         "language": "english",
//     //         "pages": 264,
//     //         "publisher": "Princeton University Press",
//     //         "title": "Power-Up: Unlocking Hidden Math in Video Games",
//     //         "year": 2017
//     //       }
//     //     ]
//     //   });
//   });
// });







// afterEach(async function () {
// });
// afterAll(async function () {
//   let result = db.query('DELETE FROM books')
//   await db.end;
// });


process.env.NODE_ENV = "test"

const request = require("supertest");


const app = require("../app");
const db = require("../db");


// isbn of sample book
let book_isbn;


beforeEach(async () => {
  let result = await db.query(`
    INSERT INTO
      books (isbn, amazon_url,author,language,pages,publisher,title,year)
      VALUES(
        '123432122',
        'https://amazon.com/taco',
        'Elie',
        'English',
        100,
        'Nothing publishers',
        'my first book', 2008)
      RETURNING isbn`);

  book_isbn = result.rows[0].isbn
});


describe("POST /books", function () {
  test("Creates a new book", async function () {
    const response = await request(app)
        .post(`/books`)
        .send({
          "book":{
            "isbn":"123432asr",
            "amazon_url":"www.google.com",
            "author": "davici",
            "language":"english"
            
          }
        });
    expect(response.statusCode).toBe(201);
    expect(response.body.book).toHaveProperty("isbn");
  });

  test("Prevents creating book without required title", async function () {
    const response = await request(app)
        .post(`/books`)
        .send({year: 2000});
    expect(response.statusCode).toBe(400);
  });
});


describe("GET /books", function () {
  test("Gets a list of 1 book", async function () {
    const response = await request(app).get(`/books`);
    const books = response.body.books;
    expect(books).toHaveLength(1);
    expect(books[0]).toHaveProperty("isbn");
    expect(books[0]).toHaveProperty("amazon_url");
  });
});


describe("GET /books/:isbn", function () {
  test("Gets a single book", async function () {
    const response = await request(app)
        .get(`/books/${book_isbn}`)
    expect(response.body.book).toHaveProperty("isbn");
    expect(response.body.book.isbn).toBe(book_isbn);
  });

  test("Responds with 404 if can't find book in question", async function () {
    const response = await request(app)
        .get(`/books/999`)
    expect(response.statusCode).toBe(404);
  });
});


describe("PUT /books/:id", function () {
  test("Updates a single book", async function () {
    const response = await request(app)
        .put(`/books/${'123432asr'}`)
        .send({
          "book":{
            "isbn":"123432asr",
            "amazon_url":"www.google.com",
            "author": "davici",
            "language":"english",
            'title': "UPDATED BOOK"
            
          }
        });
    // expect(response.body.book).toHaveProperty("isbn");
    expect(response.body.book.title).toBe("UPDATED BOOK");
  });

  test("Prevents a bad book update", async function () {
    const response = await request(app)
        .put(`/books/${'123432asr'}`)
        .send({
          "book":{
            "isbn":"123432asr",
            "amazon_url":"www.google.com",
            "author": "davici",
            "language":"english"
            
          }
        });
    expect(response.statusCode).toBe(200);
  });

  test("Responds 404 if can't find book in question", async function () {
    // delete book first
    await db.query('DELETE FROM books')
    // await request(app).delete(`/books/`)
    const response = await request(app).delete('/books')
    const response1 = await request(app).get('/books')
    // console.log(response._maxListeners)
    expect(response1.statusCode).toBe(404);
  });
});


describe("DELETE /books/:id", function () {
  test("Deletes a single a book", async function () {
    const response = await request(app)
        .delete(`/books/${book_isbn}`)
    expect(response.body).toEqual({message: "Book deleted"});
  });
});


afterEach(async function () {
  await db.query("DELETE FROM BOOKS");
});


afterAll(async function () {
  await db.end()
});