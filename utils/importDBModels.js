const glob = require( 'glob' )
const path = require( 'path' );

module.exports = () => {
    glob.sync( './models/*.js' ).forEach( function( file ) {
        require( path.resolve( file ) );
      });
}