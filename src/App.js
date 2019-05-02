// @flow

import React, {Component} from 'react';
import GraphiQL from 'graphiql';
import CodeExporter from 'graphiql-code-exporter';
import codeExporterDefaultSnippets from 'graphiql-code-exporter/lib/snippets';
import {getIntrospectionQuery, buildClientSchema} from 'graphql';

import 'graphiql/graphiql.css';
import 'graphiql-code-exporter/CodeExporter.css';
import './App.css';

import type {GraphQLSchema} from 'graphql';

const APP_ID = 'c333eb5b-04b2-4709-9246-31e18db397e1';

const serverUrl = `https://serve.onegraph.com/dynamic?app_id=${APP_ID}`;

function fetcher(params: Object): Object {
  return fetch(serverUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  })
    .then(function(response) {
      return response.text();
    })
    .then(function(responseBody) {
      try {
        return JSON.parse(responseBody);
      } catch (e) {
        return responseBody;
      }
    });
}

const DEFAULT_QUERY = `{
  npm {
    package(name: "graphql") {
      name
      downloads {
        lastMonth {
          count
        }
      }
    }
  }
}`;

type State = {
  schema: ?GraphQLSchema,
  query: string,
  codeExporterIsOpen: boolean,
  variables: string, // Will be the raw text input from GraphiQL's `variables` pane
};

class App extends Component<{}, State> {
  _graphiql: GraphiQL;
  state = {
    schema: null,
    query: DEFAULT_QUERY,
    codeExporterIsOpen: true,
    variables: '',
  };

  componentDidMount() {
    fetcher({
      query: getIntrospectionQuery(),
    }).then(result => {
      this.setState({schema: buildClientSchema(result.data)});
    });
  }

  _handleEditQuery = (query: string): void => this.setState({query});

  _handleToggleCodeExporter = () =>
    this.setState({
      codeExporterIsOpen: !this.state.codeExporterIsOpen,
    });

  _handleEditVariables = (variables: string) => {
    this.setState({variables});
  };

  render() {
    const {query, schema} = this.state;

    const codeExporter = this.state.codeExporterIsOpen ? (
      <CodeExporter
        hideCodeExporter={this._handleToggleCodeExporter}
        snippets={codeExporterDefaultSnippets}
        serverUrl={serverUrl}
        context={{
          appId: APP_ID,
        }}
        variables={'asdf'}
        headers={{}}
        query={query}
        // Optional if you want to use a custom theme
        codeMirrorTheme="neo"
      />
    ) : null;

    return (
      <div className="graphiql-container">
        <GraphiQL
          ref={ref => (this._graphiql = ref)}
          fetcher={fetcher}
          schema={schema}
          query={query}
          onEditQuery={this._handleEditQuery}
          onEditVariables={this._handleEditVariables}>
          <GraphiQL.Toolbar>
            <GraphiQL.Button
              onClick={() => this._graphiql.handlePrettifyQuery()}
              label="Prettify"
              title="Prettify Query (Shift-Ctrl-P)"
            />
            <GraphiQL.Button
              onClick={() => this._graphiql.handleToggleHistory()}
              label="History"
              title="Show History"
            />
            <GraphiQL.Button
              onClick={this._handleToggleCodeExporter}
              label="Code Exporter"
              title="Toggle Code Exporter"
            />
          </GraphiQL.Toolbar>
        </GraphiQL>
        {codeExporter}
      </div>
    );
  }
}

export default App;
