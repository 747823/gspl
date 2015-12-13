

// Spline drawing class
define( "gspl/spline", [ "gspl/gspl", "gspl/utility", "gspl/point" ], function( gspl ) {
	
	// Here we define the spline as a class as part of the gspl "namespace".
	// that way everything is part of the gspl object 
	// and you don't have generic constructor functions like "spline" polluting the global ns
	gspl.spline = function( useroptions, canvas )
	{
		// This makes gspl.spline() return a new spline even if the calling code is missing the "new" keyword
		if ( this instanceof gspl.spline === false ) { return new gspl.spline( useroptions ); }
		
		this.canvas = null;			// the canvas this spline will be rendered on
		this.points = [];			// the spline's control points
		this.pts = [];				// temporary control points for doing alternate calculations
		this.manager = null;			// the spline's manager ( if it has one )
		
		// Spline default options
		this.options = {
			hidden: false,			// if true, all rendering of the spline is hidden
			autoDraw: true,		// if true, automatically re-draws the canvas after changes
			drawPoints: true,		// if true, draws the control points
			drawPoly: true,			// if true, draws the polyline
			drawSpline: true,		// if true, draws the spline
			pointColor: "#c6dee9",		// the color of the control points, if drawn
			lastPointColor: "#c",		// #e68729 - dark orange. #ebaf22 - light orange
			polyColor: "#c6dee9",		// the color of the polyline, if drawn
			splineColor: "#2fb4f0",		// the color of the spline, if drawn
			pointWidth: 3,			// the size of the control points in pixels, if drawn
			polyWidth: 0.5,			// the width of the polyline in pixels if drawn
			splineWidth: 3,			// the width of the spline in pixels if drawn
			closed: false,			// if true, closes the loop of the spline
			ends: true,			// if true, extends spline all the way to the endpoints
			resolution: 25,			// smaller numbers are more precise, higher are more jagged
			showHypothetical: true,	// if true, shows a hypothetical last point that hasn't been added yet
		}
		
		// Apply useroptions, if any exist
		for ( opt in useroptions )
		{
			if ( this.options[opt] )
			{
				this.options[opt] = useroptions[opt];
			}
		}
		
		// Apply canvas if it exists
		if ( canvas != undefined )
		{
			this.setCanvas( canvas );
		}
	}
	
	// Adds a point to the spline
	gspl.spline.prototype.addPoint = function( pt )
	{
		if ( pt instanceof gspl.point )
		{
			// pt is a point reference, add the point
			this.points.push( pt );
		}
		
		// re-render
		this.autoDrawHelper();
	}
	
	// Removes a point by reference or by index
	// If no point or index was passed, remove the last point in the array
	gspl.spline.prototype.removePoint = function( pt )
	{
		if ( pt instanceof gspl.point )
		{
			// Remove by reference
			for ( var i = 0; i < this.points.length; i++ )
			{
				if ( this.points[i] === pt )
				{
					this.points.splice( i, 1 );
					break;
				}
			}
		}
		else if ( typeof pt === "number" )
		{
			// Remove by index
			this.points.splice( pt, 1 );
		}
		else
		{
			// Remove last point
			this.points.splice( this.points.length - 1, 1 );
		}
		
		// Re-render
		this.autoDrawHelper();
	}
	
	// Removes all points
	gspl.spline.prototype.clearPoints = function()
	{
		this.points = [];
		
		// re-render
		this.autoDrawHelper();
	}
	
	// Sets a canvas to draw the spline on
	gspl.spline.prototype.setCanvas = function( canvas )
	{
		if ( canvas.getContext != undefined )
		{
			// The canvas parameter was actually a canvas
			this.canvas = canvas;
		}
		else
		{
			console.log("spline.setCanvas: the supplied canvas parameter is not a canvas element.");
		}
	}
	
	// Autodraw helper function
	gspl.spline.prototype.autoDrawHelper = function()
	{
		if ( this.options.autoDraw === true )
		{ 
			// Check if this spline has a manager
			if ( this.manager instanceof gspl.manager )
			{
				// If so, we want to render through the manager
				// To make sure we aren't erasing all the other splines as well
				this.manager.render();
			}
			else
			{
				// Otherwise clear the canvas and draw
				this.draw();
			}
		}
	}
	
	// Draws the spline to the canvas
	gspl.spline.prototype.draw = function( clear )
	{
		//get canvas
		if ( this.canvas instanceof HTMLElement && this.options.hidden === false )
		{
			var ctx = this.canvas.getContext("2d");
			
			var zoom = 1;
			var offset = { x: 0, y: 0 };
			
			// Get scale and offset from manager, if one exists
			if ( this.manager )
			{
				zoom = this.manager.options.zoom;
				offset = this.manager.options.offset;
			}
			
			// If clear is true or undefined the canvas is cleared first.
			// To prevent the canvas from being cleared, set it false
			if ( clear === undefined || clear === true )
			{
				ctx.clearRect( 0, 0, 2600, 2600 );
			}
		
			//draw the polyline points and segments
			for ( var m = 0; m < this.points.length; m++ )
			{
				//Draw point
				if ( this.options.drawPoints )
				{
					ctx.beginPath();
					ctx.fillStyle = this.options.pointColor;
					ctx.arc( this.points[m].x + offset.x, this.points[m].y + offset.y, this.options.pointWidth, 0, Math.PI*2, true );
					ctx.closePath();
					ctx.fill();
				}
		
				//Draw line to next point
				if ( this.points[m+1] && this.options.drawPoly )
				{
					ctx.fillStyle = "transparent";
					ctx.lineWidth = this.options.polyWidth;
					ctx.beginPath();
					ctx.strokeStyle = this.options.polyColor;
					ctx.moveTo( this.points[m].x + offset.x, this.points[m].y + offset.y );
					ctx.lineTo( this.points[m+1].x + offset.x, this.points[m+1].y + offset.y );
					ctx.stroke();
				}
			}
		
			var spline_p;
			var spline_p2;
			var polyline_distance = gspl.utility.sum( this.getSegmentLengths( this.points ) );
		
			//Draw the spline as a high-res polyline
			for ( n = 0; n < polyline_distance; n += this.options.resolution )
			{
				//draw a single spline point
				spline_p = this.evaluate( n );
				spline_p2 = this.evaluate( n + this.options.resolution );
		
				ctx.fillStyle = "transparent";
				ctx.lineWidth = this.options.splineWidth;
				ctx.beginPath();
				ctx.strokeStyle = this.options.splineColor;
				ctx.moveTo( spline_p.x + offset.x, spline_p.y + offset.y );
				ctx.lineTo( spline_p2.x + offset.x, spline_p2.y + offset.y );
				ctx.stroke();
			}
		}
	}
	
	// Hides this spline and updates render
	gspl.spline.prototype.hide = function()
	{
		this.options.hidden = true;
		this.autoDrawHelper();
	}
	
	// Shows this spline and updates render
	gspl.spline.prototype.unhide = function()
	{
		this.options.hidden = false;
		this.autoDrawHelper();
	}
	
	// Evaluates the spline at a certain percentage and returns the resulting point
	gspl.spline.prototype.evaluate = function( t )
	{
		// Initialize spline point to return after evaluating
		var evalpoint = new gspl.point();
		
		// Define some variables to be used later
		var segmentsLength = null;
		var segmentsFull = null;
		var t_normalized = null;
		
		// Start total weight at 0
		var totalweight = 0;
		
		// New temporary points array for adding imaginary points
		this.pts = [];
		this.pts = this.points.slice(0);
		
		// console.log( this.points.length );
		// console.log( this.pts.length );
		
		// Calculate the weights for each point and store them in .w member
		// if ( this.options.closed === true )
		// {
			// If cloeed loop is true, we need to "wrap" the weight function to the other end
			// Until we get through half of the pts.
		// }
		// else 
		// {
			// if ( this.options.ends === true )
			// {
				// If (extend to) ends is true, we need to add 3 imaginary pts
				// At each endpoint, and include them in the weight
				// this.pts.push( new gspl.point( 0, 0, 0 ) );
			// }
			
			// Get segment lengths between poly-line points
			var segmentsLength = this.pts.length - 1;
			var segmentsFull = gspl.utility.sum( this.getSegmentLengths( this.pts ) );
			
			// Normalize t, it should come in as a distance out of the total distance of the segments
			t = gspl.utility.clamp( t, 0, segmentsFull );
			var t_normalized = t / segmentsFull * segmentsLength;
			
			// Normal, no ends or closed loop
			for ( var i = 0; i < this.pts.length; i++ )
			{
				var weight = t_normalized - i;
				this.pts[i].w = Math.pow( 1.8121878856, -( Math.pow( weight, 2 ) / 0.7) );
				totalweight += this.pts[i].w;
			}
		// }

		// Then add the pts together while taking weight into account
		for ( var j = 0; j < this.pts.length; j++ )
		{
			//console.log("point " + j + " weight: " + this.points[j].w / totalweight );
			evalpoint.x += this.pts[j].x * this.pts[j].w / totalweight;
			evalpoint.y += this.pts[j].y * this.pts[j].w / totalweight;
			evalpoint.z += this.pts[j].z * this.pts[j].w / totalweight;
		}
		
		pts = null;
		
		//Return evaluated point on the spline
		return evalpoint;
	}
	
	// Returns an array of the length of each polyline segment between control points
	// If no set of points is specified, uses this.points by default
	gspl.spline.prototype.getSegmentLengths = function( pts )
	{
		if ( pts === undefined || !pts.length )
		{
			pts = this.points;
		}
		
		var segments = [];
		for ( i = 0; i < pts.length - 1; i++ )
		{
			segments.push( gspl.point.distance3d( pts[i], pts[i + 1] ) );
		}
		return segments;
	}
	
	// Destroy all the properties of the spline
	gspl.spline.prototype.destroy = function()
	{
		for ( each in this )
		{
			this[ each ] = undefined;
		}
	}
	
	return gspl;
	
} );

