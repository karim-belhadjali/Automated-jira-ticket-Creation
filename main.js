var Client = require("node-rest-client").Client;
const readline = require("readline-sync");

var PST = "12416";
var issueType = "11404";
var componentFE = "15516";
var componentBE = "14915";
var customfield_12555 = "13922";
var customfield_12510 = "14864";
var username = "Soliam_QA";
var issuelinks = "issuelinks";
var issuelinks_linktype = "issuelinks";
var issue = null;
var summary = null;
var priority = null;

client = new Client();
// Provide user credentials, which will be used to log in to JIRA.
var loginArgs = {
  data: {
    username: "Soliam_QA",
    password: "opqZYQ950-/*",
  },
  headers: {
    "Content-Type": "application/json",
  },
};

let ticketId = readline.question("What is your main ticket id?");
console.log(ticketId);

client.post(
  "https://jira.vermeg.com/rest/auth/1/session",
  loginArgs,
  function (data, response) {
    if (response.statusCode == 200) {
      console.log(data.session);

      var session = data.session;
      // Get the session information and store it in a cookie in the header
      var searchArgs = {
        headers: {
          // Set the cookie from the session information
          cookie: session.name + "=" + session.value,
          "Content-Type": "application/json",
        },
        data: {
          // Provide additional data for the JIRA search. You can modify the JQL to search for whatever you want.
          jql: "key = " + ticketId,
        },
      };

      // Make the request return the search results, passing the header information including the cookie.
      client.post(
        "https://jira.vermeg.com/rest/api/2/search",
        searchArgs,
        function (searchResult, response) {
          if (searchResult.issues.length != 0) {
            issue = searchResult.issues[0];
            summary = issue.fields.summary;
            priority = issue.fields.priority.id;
            var creationArgs = {
              headers: {
                // Set the cookie from the session information
                cookie: session.name + "=" + session.value,
                "Content-Type": "application/json",
                accept: "application/json",
              },
              data: getCreationBody(),
            };
            client.post(
              "https://jira.vermeg.com/rest/api/2/issue",
              creationArgs,
              (creationResult, response) => {
                console.log(JSON.stringify(response));
              }
            );
          } else {
            throw "No issues found";
          }
        }
      );
    } else {
      throw "Login failed :(";
    }
  }
);
getCreationBody = () => {
  return {
    update: {},
    fields: {
      summary: summary,
      issuetype: {
        id: issueType,
      },
      components: [
        {
          id: componentFE,
        },
      ],
      customfield_12510: {
        id: customfield_12510,
      },
      customfield_12555: {
        id: customfield_12555,
      },
      project: {
        id: PST,
      },
      reporter: {
        name: username,
      },
      priority: {
        id: priority,
      },
      assignee: {
        name: username,
      },
    },
  };
};
