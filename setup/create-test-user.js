db.createUser(
    {
        user: "user",
        pwd: "user",
        roles: [
          { role: "readWrite", db: "test" }
        ]
    });