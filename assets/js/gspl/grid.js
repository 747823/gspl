

// Grid drawing class for canvas
define( "gspl/grid", [ "gspl/gspl" ], function( gspl ) {
	
	// Here we define the grid class
	gspl.grid = function( useroptions, canvas )
	{
		// This makes gspl.grid() return a new grid instance even if the calling code is missing the "new" keyword
		if ( this instanceof gspl.grid === false ) { return new gspl.grid( useroptions ); }
		
		this.canvas = null; 	// the canvas the grid will be drawn on
		this.manager = null;
		
		// Grid default options
		this.options = {
			
			drawThinLines: true,
			thinLineColor: "#444",
			thinLineWidth: 0.5,
			thinLineInterval: 30,
			
			drawThickLines: true,
			thickLineColor: "#444",
			thickLineWidth: 1,
			thickLineInterval: 300,
			
			drawAxisLines: false,
			axisLineWidth: 2,
			axisLineXColor: "#F00",
			axisLineYColor: "#0F0",
			/* axisLineZcolor: "#00F", */
		}
	}
	
	gspl.grid.prototype.draw = function()
	{
		if ( this.canvas instanceof HTMLElement )
		{
			var ctx = this.canvas.getContext("2d");
			
			// var zoom = this.manager.options.zoom;
			var offset = { x: 0, y: 0 }
			if ( this.manager instanceof gspl.manager )
			{
				offset = this.manager.options.offset;
			}
			
			ctx.fillStyle = "transparent";
			ctx.strokeStyle = this.options.thinLineColor;
			ctx.lineWidth = this.options.thinLineWidth;
			// Draw thin lines
			for ( var i = 0; i < window.innerWidth;  i++ )
			{
				if ( ( i - offset.x ) % this.options.thinLineInterval === 0 )
				{
					ctx.beginPath();
					ctx.moveTo( i, 0 );
					ctx.lineTo( i, window.innerHeight );
					ctx.stroke();
				}
			}
			for ( var j = 0; j < window.innerHeight;  j++ )
			{
				if ( ( j - offset.y ) % this.options.thinLineInterval === 0 )
				{
					ctx.beginPath();
					ctx.moveTo( 0, j );
					ctx.lineTo( window.innerWidth, j );
					ctx.stroke();
				}
			}
			
			// Draw thick lines
			ctx.strokeStyle = this.options.thickLineColor;
			ctx.lineWidth = this.options.thickLineWidth;
			for ( var m = 0; m < window.innerWidth;  m++ )
			{
				if ( ( m - offset.x ) % this.options.thickLineInterval === 0 )
				{
					ctx.beginPath();
					ctx.moveTo( m, 0 );
					ctx.lineTo( m, window.innerHeight );
					ctx.stroke();
				}
			}
			for ( var n = 0; n < window.innerHeight;  n++ )
			{
				if ( ( n - offset.y ) % this.options.thickLineInterval === 0 )
				{
					ctx.beginPath();
					ctx.moveTo( 0, n );
					ctx.lineTo( window.innerWidth, n );
					ctx.stroke();
				}
			}

		}
	}
	
	return gspl;
	
} );

