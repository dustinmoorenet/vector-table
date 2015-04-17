var _ = require('lodash');
var Events = require('ampersand-events');
var ProjectStore = require('../libs/ProjectStore');
var LoginModal = require('../views/LoginModal');

/*
Empty app loads
if user info present in cache
  request user info (if not guest)
  if user session not valid
    show login modal
  else
    show project list modal
    request project info (if not guest)
else if not
  show login modal

login modal
  select guest user
    create new user
    create new project
  give email address
    display modal explaining to check email

1) guest user (no prior user)
  show login modal
  select guest user
  create new user
  create new project

2) guest user (valid prior user session)
  load user
  load project (if url includes projectID)
  user clicks logout
  see section 1

3) guest user (invalid prior user session)
  redirect to /
  see section 1

4) user (no prior user)
  show login modal
  give email
  show instructions

5) user (valid prior same user session)
  load user
  load project (if url includes projectID)

6) user (valid prior different user session)
  load user
  load project (if url includes projectID)
  user clicks logout
  see section 4

7) user (invalid prior session)
  redirect to /
  see section 4
*/

function User() {
    this.listenTo(global.appStore, 'user', this.onUser);
}

_.extend(User.prototype, Events, {
    create: function() {
        // NO username or password, just an auth link they use to access the app
        // The session should never expire, but all session should be listed for
        // user to invalidate. Multiple devices can be connected using the same
        // user so multiple sessions are created.
    },
    login: function() {

    },
    logout: function() {

    },
    onUser: function(user) {
        if (!user) {
            window.location.href = '/logout';

            return;
        }

        this.userID = user.id;

        this.projectStore = new ProjectStore();
    },
    showLogin: function() {
        var modal = new LoginModal();
        modal.render();
        body.appendChild(modal.el);
    }
});

module.exports = User;
