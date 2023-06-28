import { faker } from '@faker-js/faker';

const post = {
  title: faker.word.adjective(),
  body: faker.word.words(),
  userId: 1
};

const newPost = {
  title: faker.word.adjective(),
  body: faker.word.words(),
  userId: 1
};



it('Get all posts', () => {
  cy.log(`Get all posts`)

  cy.request('GET', `/posts`).then(response => {
    expect(response.status).to.be.equal(200);
    expect(response.headers['content-type']).to.include('application/json');
  })
})



it('Get only first 10 posts', () => {
  cy.log('Get only first 10 posts');

  cy.request('GET', '/posts?_limit=10').then(response => {
    expect(response.status).to.be.equal(200);

    const posts = response.body;
    expect(posts).to.be.an('array').and.have.lengthOf.at.most(10);

    const firstTenPosts = posts.slice(0, 10);
    expect(posts).to.deep.equal(firstTenPosts);
  });
});



it('Get posts with specific id', () => {
  cy.log('Get posts with specific id');

  cy.request('GET', '/posts?id=55&id=60').then(response => {
    expect(response.status).to.be.equal(200);

    const posts = response.body;
    const ids = posts.map(post => post.id);

    expect(ids).to.include(55);
    expect(ids).to.include(60);
  });
});



it('Create a post and verify 401 Unauthorized', () => {
  cy.log('Create a post and verify 401 Unauthorized');

  cy.request({
    method: 'POST',
    url: '/664/posts',
    body: post,
    failOnStatusCode: false
  }).then(response => {
    expect(response.status).to.be.equal(401);
  });
});



it('Create a post with access token', () => {
  cy.log('Create a post with access token in header');

  const accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImJ1Y2h5bnNrYXlhLmp1bGlhQGdtYWlsLmNvbSIsImlhdCI6MTY4Nzk0OTc5MCwiZXhwIjoxNjg3OTUzMzkwLCJzdWIiOiIxMSJ9.vz70fb3zU3iYOIdMcELzSWcG54HyYyjBvNecmpXFj-4';

  cy.request({
    method: 'POST',
    url: '/664/posts',
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    body: post
  }).then(response => {
    expect(response.status).to.be.equal(201);
    expect(response.body).to.deep.include(post);
  });
});



it('Create post entity', () => {
  cy.log('Create post entity');

  cy.request({
    method: 'POST',
    url: '/posts',
    body: post,
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(response => {
    expect(response.status).to.be.equal(201);
    expect(response.body.title).to.equal(post.title);
    expect(response.body.body).to.equal(post.body);
    expect(response.body.userId).to.equal(post.userId);
  });
});



it('Update non-existing entity', () => {
  cy.log('Update non-existing entity');

  const postId = 12345;
  const updatedPost = {
    title: faker.word.adjective(),
    body: faker.word.words(),
    userId: 1
  };

  cy.request({
    method: 'PUT',
    url: `/posts/${postId}`,
    body: updatedPost,
    failOnStatusCode: false
  }).then(response => {
    expect(response.status).to.be.equal(404);
  });
});



it('Create and update post entity', () => {
  cy.log('Create and update post entity');

  cy.request({
    method: 'POST',
    url: '/posts',
    body: newPost
  }).then(createResponse => {
    expect(createResponse.status).to.be.equal(201);
    expect(createResponse.body).to.deep.include(newPost);

    const postId = createResponse.body.id;

    cy.log('Update the created post');
    const updatedPost = {
      ...newPost,
      title: 'Updated Post',
      body: 'This is the updated content of the post.'
    };

    cy.request({
      method: 'PUT',
      url: `/posts/${postId}`,
      body: updatedPost
    }).then(updateResponse => {
      expect(updateResponse.status).to.be.equal(200);
      expect(updateResponse.body).to.deep.include(updatedPost);
    });
  });
});



it('Delete non-existing post entity', () => {
  cy.log('Delete non-existing post entity');

  cy.request({
    method: 'DELETE',
    url: '/posts/123',
    failOnStatusCode: false
  }).then(response => {
    expect(response.status).to.be.equal(404);
  });
});



it('Create, Update, and Delete post entity', () => {
  cy.log('Create, Update, and Delete post entity');

  cy.request('POST', '/posts', newPost).then(createResponse => {
    expect(createResponse.status).to.be.equal(201);

    const createdPost = createResponse.body;

    cy.log('Update new post')
    const updatedPost = {
      ...createdPost,
      title: faker.word.adjective(),
      body: faker.word.words(),
    };

    cy.request('PUT', `/posts/${createdPost.id}`, updatedPost).then(updateResponse => {
      expect(updateResponse.status).to.be.equal(200);

      cy.log('Delete new post')
      cy.request('DELETE', `/posts/${createdPost.id}`).then(deleteResponse => {
        expect(deleteResponse.status).to.be.equal(200);
        expect(deleteResponse.body).to.be.empty;
      });
    });
  });
});

