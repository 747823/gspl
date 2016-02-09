
// Gaussian spline utility functions
define( "gspl/utility", [ "gspl/gspl" ] , function( gspl ) {
	
	// Utility object
	gspl.utility = {
	
		// Sums all values in an array, optionally stopping at index n
		sum: function( arr, n ) 
		{
			var sum = 0;
			if ( typeof n === "undefined" )
			{
				n = arr.length-1;
			}
			for ( i = 0; i < n+1; i++ )
			{
				if ( typeof arr[i] === "number" )
				{
					sum += arr[i];
				}
			}
			return sum;
		},
		
		// Clamps n between min and max
		clamp: function( n, min, max ) 
		{
			return Math.max( min, Math.min( n, max ) );
		}
		
	}
	
	return gspl;
	
} );
