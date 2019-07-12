const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const Blog = require("../models/blog");

const initialBlogs = [
  {
    title: "This is difficult",
    author: "me",
    url: "www.gottdoitanyways.dk",
    likes: 1002
  },
  {
    title: "This is not difficult",
    author: "not me",
    url: "www.gottdoitanyways.dk",
    likes: 102
  }
];

describe("Testing GET requests", () => {
  beforeEach(async () => {
    await Blog.deleteMany({});
    //populate test db
    let blogObject = new Blog(initialBlogs[0]);
    await blogObject.save();
    blogObject = new Blog(initialBlogs[1]);
    await blogObject.save();
  });

  test("there are 2 blogs", async () => {
    const response = await api.get("/api/blogs");
    expect(response.body.length).toBe(initialBlogs.length);
  });

  test("the first is about difficulties in life", async () => {
    const response = await api.get("/api/blogs");
    const titles = response.body.map(r => r.title);
    expect(titles).toContain("This is difficult");
  });

  test("see specific blog with a valid id", async () => {
    const response = await api.get("/api/blogs");

    const blogToView = response.body[0];

    const resultBlog = await api
      .get(`/api/blogs/${blogToView._id}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(resultBlog.body).toEqual(blogToView);
  });

  test("blogs are returned as json", async () => {
    await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });
});
describe("Testing POST requests", () => {
  test("a valid blog can be added ", async () => {
    const blogsAtStart = await "/api/blogs";
    const newBlog = {
      title: "why not working?",
      authot: "me",
      url: "www.sucks.dk",
      likes: 1
    };

    await api
      .post("/api/blogs")
      .send(newBlog)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    const response = await api.get("/api/blogs");

    const titles = response.body.map(r => r.title);

    expect(response.body.length).toBe(initialBlogs.length + 1);
    expect(titles[2]).toContain("why not working?");
  });
});
describe("delete blog by id", () => {
  test("delete specific note by id", async () => {
    const blogsAtStart = await api.get("/api/blogs");
    console.log("blog list length: ", blogsAtStart.body.length);
    const blogToDelete = blogsAtStart.body[0];

    await api.delete(`/api/blogs/${blogToDelete._id}`).expect(204);

    const blogsAtEnd = await api.get("/api/blogs");
    expect(blogsAtEnd.body.length).toBe(blogsAtStart.body.length - 1);

    const titles = blogsAtEnd.body.map(b => b.title);

    expect(titles).not.toContain(blogToDelete.title);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
