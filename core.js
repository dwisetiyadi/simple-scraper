/**
 * @author Dwi Setiyadi
 */

/* eslint-disable no-console */

import Hapi from '@hapi/hapi';
import Vision from '@hapi/vision';
import Handlebars from 'handlebars';
import Config from './app/config';

const run = async () => {
  const server = new Hapi.Server({
    port: Config.port,
    host: Config.host,
  });

  await server.register(Vision);
  server.views({
    engines: {
      html: Handlebars,
    },
    path: 'app/views',
    layoutPath: 'app/views/layouts',
    layout: 'default',
    helpersPath: 'app/views/helpers',
  });

  server.route(Config.router);

  await server.start();
  console.log(`\nServer running at: ${server.info.uri}\n\n`);
};

process.on('unhandledRejection', (error) => {
  console.log(error);
  process.exit(1);
});

run();
