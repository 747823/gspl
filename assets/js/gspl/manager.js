

// Spline manager class for managing multiple splines drawn on the same canvas
// This will essentially just keep the zoom, pan, and rendering order of many splines in sync
define( "gspl/manager", [ "gspl/gspl", "gspl/spline", "gspl/grid" ], function( gspl ) {
	
	gspl.manager = function( useroptions, canvas )
	{
		if ( this instanceof gspl.manager === false ) { return new gspl.manager( useroptions, canvas ); }
		
		this.splines = [];		// The splines managed by this manager
		this.canvas = null;		// The canvas this manager will render its splines and grid to
		this.grid = new gspl.grid();	// The grid
		this.grid.manager = this;	// Set grid manager
		this.active = -1;		// The index of the currently active spline. -1 means no active splines
		
		// Options for the manager
		// Zoom currently is not functional, may implement it later
		// I just haven't felt like getting the math for it straight yet
		this.options = {
			showGrid: true,
			zoom: 2,
			offset: {
				x: 0,
				y: 0,
			}
		};
		
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
		
		// Render the grid by default
		this.render();
	}
	
	// Sets a canvas to draw on
	gspl.manager.prototype.setCanvas = function( canvas )
	{
		if ( canvas.getContext != undefined )
		{
			// The canvas parameter was actually a canvas
			this.canvas = canvas;
		}
		else
		{
			console.log("manager.setCanvas: the supplied canvas parameter is not a canvas element.");
		}
	}
	
	// Renders all the splines and the grid in order
	gspl.manager.prototype.render = function()
	{
		// We can only do this is the canvas is a canvas
		if ( this.canvas instanceof HTMLElement )
		{
			// Clear the canvas
			var ctx = this.canvas.getContext("2d");
			ctx.clearRect( 0, 0, 2600, 2600 );
			
			// Render the grid if it's there
			if ( this.grid instanceof gspl.grid && this.options.showGrid === true )
			{
				// Make sure it's rendering on the same canvas, then draw
				this.grid.canvas = this.canvas;
				this.grid.draw();
			}
			
			// Render each spline
			for ( var i = 0; i < this.splines.length; i++ )
			{
				// Make sure it's rendering on the same canvas
				this.splines[i].canvas = this.canvas;
				
				// Skip active spline for now
				if ( i != this.active )
				{
					// Set the clear parameter to false so it doesn't clear the canvas
					this.splines[i].draw( false );
				}
			}
			
			// Render the active spline last so it draws on top of the other ones
			if ( this.splines[ this.active ] )
			{
				this.splines[ this.active ].draw( false );
			}
		}
	}
	
	// Adds splines to the manager
	gspl.manager.prototype.addSpline = function( spline )
	{
		if ( spline instanceof gspl.spline )
		{
			// Add spline to array
			this.splines.push( spline );
			
			// Set the new spline as active
			this.setActiveSpline( this.splines.length - 1 );
			
			// Set spline's manager reference
			spline.manager = this;
		}
		
		// Set the splines to not auto-draw
		// The manager will render them on its canvas
		// spline.options.autoDraw = false;
		spline.canvas = this.canvas;
		this.render();
	}
	
	// Remove a spline from the manager
	gspl.manager.prototype.removeSpline = function( spline )
	{
		for ( var i = 0; i < this.splines.length; i++ )
		{
			if ( this.splines[i] === spline )
			{
				// If this spline is active, clear active spline
				this.setActiveSpline( -1 );
				
				// Nullify spline reference to this
				spline.manager = null;
				
				// Remove spline from the array
				this.splines.splice( i, 1 );
				
				// Re-render
				this.render();
				break;
			}
		}
	}
	
	// Deletes a spline entirely
	gspl.manager.prototype.deleteSpline = function( spline )
	{
		if ( spline instanceof gspl.spline )
		{
			this.removeSpline( spline );
			spline.destroy();
			spline = undefined;
		}
	}
	
	// Returns the currently active spline.
	gspl.manager.prototype.getActiveSpline = function()
	{
		if ( this.splines[ this.active ] instanceof gspl.spline )
		{
			return this.splines[ this.active ];
		}
		else
		{
			// Return false if the active spline didn't exist
			return false;
		}
	}
	
	// Sets the currently active spline by int or reference
	gspl.manager.prototype.setActiveSpline = function( active )
	{
		// Round the number and make sure it's a number
		if ( typeof active === "number" )
		{
			this.active = Math.floor( active );
			
			// Only show control points for the active spline
			for ( var i = 0; i < this.splines.length; i++ )
			{
				if ( i === this.active )
				{
					this.splines[i].options.drawPoly = true;
					this.splines[i].options.drawPoints = true;
				}
				else
				{
					this.splines[i].options.drawPoly = false;
					this.splines[i].options.drawPoints = false;
				}
			}
		}
		else if ( active instanceof gspl.spline )
		{
			// Otherwise set by reference
			for ( var j = 0; j < this.splines.length; j++  )
			{
				if ( this.splines[j] === active )
				{
					this.active = j;
					this.splines[j].options.drawPoly = true;
					this.splines[j].options.drawPoints = true;
				}
				else
				{
					this.splines[j].options.drawPoly = false;
					this.splines[j].options.drawPoints = false;
				}
			}
		}
		this.render();
	}
	
	// Zooms in or out by a factor parameter
	gspl.manager.prototype.zoom = function( factor )
	{
		if ( typeof factor === "number" )
		{
			this.options.zoom *= factor;
			this.render();
		}
	}
	
	// Sets the zoom to 1 (default)
	gspl.manager.prototype.zoomDefault = function()
	{
		this.options.zoom = 1;
		this.render();
	}
	
	// Sets the zoom to whatever you want
	gspl.manager.prototype.setZoom = function( n )
	{
		if ( typeof n === "number" )
		{
			this.options.zoom = n;
			this.render();
		}
	}
	
	// Pans the offset of the rendering by x or y distances
	gspl.manager.prototype.pan = function( x, y )
	{
		if ( typeof x === "number" && typeof y === "number" )
		{
			this.options.offset.x += x;
			this.options.offset.y += y;
			this.render();
		}
	}
	
	return gspl;
	
} );

