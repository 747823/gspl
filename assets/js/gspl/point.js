
// Gaussian spline point class for 3d points
define( "gspl/point", [ "gspl/gspl" ], function( gspl ) {

	// Append point class
	gspl.point = function( nx, ny, nz )
	{
		// If someone called this function without the new keyword, we return a new instance anyway
		if ( this instanceof gspl.point === false ) { return new gspl.point( nx, ny, nz ); }
		
		// Assign xyz values if they exist and are numbers
		this.x = ( nx != undefined && typeof nx === "number" ) ? nx : 0;
		this.y = ( ny != undefined && typeof ny === "number" ) ? ny : 0;
		this.z = ( nz != undefined && typeof nz === "number" ) ? nz : 0;
	}
	
	// Return the distance between two points
	gspl.point.distance3d = function( a, b )
	{
		var distxy = 0;
		var dist3d = 0;
		
		// Only do the math if the passed vars are, in fact, points. otherwise return 0
		if ( a instanceof gspl.point && b instanceof gspl.point )
		{
			distxy = Math.sqrt( (a.x-b.x)*(a.x-b.x) + (a.y-b.y)*(a.y-b.y) );
			dist3d = Math.sqrt( distxy*distxy + (a.z-b.z)*(a.z-b.z) );
		}
		
		return dist3d;
	}
	
	return gspl;
	
} );
