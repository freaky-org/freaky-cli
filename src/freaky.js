#!/usr/bin/env node
const { Command } = require('commander');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const program = new Command();
const TOKEN_FILE = path.join(__dirname, 'token.json');
const API_URL = 'https://freaky.team/api';

function saveToken(token) {
    fs.writeFileSync(TOKEN_FILE, JSON.stringify({ token }));
}

function loadToken() {
    if (fs.existsSync(TOKEN_FILE)) {
        const data = JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf-8'));
        return data.token;
    }
    return null;
}

function makeRequest(method, endpoint, data = {}) {
    const token = loadToken();

    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return axios({
        method,
        url: `${API_URL}${endpoint}`,
        headers,
        data,
    });
}

//set token
program
    .command('token <token>')
    .description('Set your authentication token')
    .action((token) => {
        saveToken(token);
        console.log('Token saved successfully!');
    });


//literally mirroring http api rn
['get', 'post', 'patch', 'put', 'delete', 'options'].forEach((method) => {
    program
        .command(`${method} <route>`)
        .description(`Make a ${method.toUpperCase()} request to the specified route`)
        .option('-b, --body <json>', 'Request body as a JSON string')
        .action(async (route, options) => {
            let data = {};
            if (options.body) {
                try {
                    data = JSON.parse(options.body);
                } catch (e) {
                    console.error('Invalid JSON format for the body.');
                    process.exit(1);
                }
            }

            try {
                const response = await makeRequest(method, route, data);
                const res = response.data;
                console.log(JSON.stringify(res.data, null, 2));
            } catch (error) {
                if (error.response) {
                    if (error.response.status === 401) {
                        console.error('Error: Unauthenticated. Please set your token with `freaky token <token>`');
                    } else {
                        console.error('Error:', error.response.data);
                    }
                } else {
                    console.error('Error:', error.message);
                }
            }
        });
});


//help
program
    .command('help')
    .description('Display help information')
    .action(() => {
        console.log(`
Welcome to FreakyCLI!

You need to set your token once to interact with routes that require authentication:

  freaky token <token>

After that, you can make HTTP requests using the following commands:

  freaky get <route>       - Make a GET request
  freaky post <route>      - Make a POST request
  freaky patch <route>     - Make a PATCH request
  freaky put <route>       - Make a PUT request
  freaky delete <route>    - Make a DELETE request
  freaky options <route>   - Make an OPTIONS request

For POST, PATCH, and PUT requests, you can include a JSON body using the --body flag:

  freaky post /users -b '{"name": "John Doe", "email": "john@example.com"}'
        `);
    });



//unknown command
program.on('command:*', () => {
    console.error('Invalid command: %s\nSee --help for a list of available commands.', program.args.join(' '));
    process.exit(1);
});

//parse input
program.parse(process.argv);

//if no command after parsing, show help
if (!process.argv.slice(2).length) {
    program.outputHelp();
}
