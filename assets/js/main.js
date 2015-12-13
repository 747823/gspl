
(function() {

	// Require the spline class
	require( [ "gspl/point", "gspl/utility", "gspl/spline", "gspl/manager" ], function() {
		
		// Records the number of splines created
		var numCreated = 0;

		var canv = document.getElementById("canv");
		var mySplineManager = new gspl.manager( {}, canv );
		
		var middleMouse = false;
		var mouseLastPos = null;
		
		var editbtns = document.getElementById("editbtns");
		var resetbtn = document.getElementById("resetbtn");
		var undobtn = document.getElementById("undobtn");
		var gridbtn = document.getElementById("gridbtn");
		
		
		// Set up the edit buttons
		resetbtn.addEventListener( "click", function(){
			mySplineManager.getActiveSpline().clearPoints();
		});
		
		undobtn.addEventListener( "click", function(){
			mySplineManager.getActiveSpline().removePoint();
		});
		gridbtn.addEventListener( "click", function(){
			if ( mySplineManager.options.showGrid === false )
			{
				this.className = "reset toggle";
				mySplineManager.options.showGrid = true;
				mySplineManager.render();
			}
			else
			{
				this.className = "reset";
				mySplineManager.options.showGrid = false;
				mySplineManager.render();
			}
		});
		
		
		// Add "ctrl-z" functionality to remove last point
		gspl.ctrlPressed = false;
		window.addEventListener("keydown", function(e){
			if ( e.keyCode === 17 )
			{
				// Pressed CTRL
				gspl.ctrlPressed = true;
			}
		});
		window.addEventListener("keyup", function(e){
			if ( e.keyCode === 17 )
			{
				// Released CTRL
				gspl.ctrlPressed = false;
			}
		});
		window.addEventListener("keydown", function(e){
			if ( gspl.ctrlPressed === true && e.keyCode === 90 )
			{
				// Pressed CTRL+Z
				mySplineManager.getActiveSpline().removePoint();
			}
		});
		
		
		// Prevent drag-scrolling with middle click
		document.getElementsByTagName("body")[0].addEventListener( "mousedown", function( e ) {
			if ( e.button === 1 )
			{
				e.preventDefault();
				return false;
			}
		});
		
		document.getElementsByTagName("body")[0].addEventListener( "mouseup", function( e ) {
			if ( e.button === 1 )
			{
				canv.className = "";
				middleMouse = false;
				mouseLastPos = null;
			}
		});
		
		
		// Set up canvas clicking to add points
		canv.addEventListener( "click", function( e ) {
			if ( e.button === 0 )
			{
				mySplineManager.getActiveSpline().addPoint(
					new gspl.point( e.pageX - mySplineManager.options.offset.x, e.pageY - mySplineManager.options.offset.y, 0 )
				);
			}
		});
		
		// Set up canvas dragging offset - only set middle mouse true on canvas
		canv.addEventListener( "mousedown", function( e ) {
			if ( e.button === 1 )
			{
				canv.className = "drag";
				middleMouse = true;
			}
		});
		
		// Stop drag on leaving the window
    		document.addEventListener( "mouseout", function( e ) {
        			var from = e.relatedTarget;
        			if ( !from || from.nodeName == "HTML" ) 
        			{
        				// Left window
        				canv.className = "";
        				middleMouse = false;
        				mouseLastPos = null;
        			}
        		});
    		
    		// Drag offset changer
    		canv.addEventListener( "mousemove", function( e ) {
    			if ( middleMouse )
    			{
    				if ( mouseLastPos != null )
    				{
    					deltaX = mouseLastPos.x - e.pageX;
    					deltaY = mouseLastPos.y - e.pageY;
    					mySplineManager.pan( -deltaX, -deltaY );
    				}
    				mouseLastPos = {
    					x: e.pageX,
    					y: e.pageY
    				}
    			}
    		});
		
		// Set up create spline button:
		document.getElementById("newspline").addEventListener( "click", function() {
			
			// Hide the help box
			document.getElementById("help1").className = "fadeout";
			
			// Create the spline
			var spl = new gspl.spline( {}, canv );
			mySplineManager.addSpline( spl );
			
			// Get the list
			var list = document.getElementsByClassName("scrollable")[0];
			
			// Deselect all existing splines
			var others = document.getElementsByClassName("splineitem selected");
			for ( var i = 0; i < others.length; i++ )
			{
				if ( others[i] != this )
				{
					others[i].className = "splineitem";
				}
			}
				
			
			// Create an html element and children for the spline
			var elem = document.createElement("div");
			elem.className = "splineitem selected";
			
			var form = document.createElement("form");
			var fname = document.createElement("input");
			fname.type = "text";
			fname.value = "New Spline " + ( ++numCreated );
			/*
			fname.onfocus = function() {
				if ( this.value === "New Spline" )
				{
					this.value = "";
				}
			}
			fname.onblur = function() {
				if ( this.value === "" )
				{
					this.value = "New Spline";
				}
			}
			*/
			form.appendChild( fname );
			form.onsubmit = function() {
				if ( fname.value === "" )
				{
					fname.value = "unnamed";
				}
				fname.blur();
				return false;
			}
			
			// Clicking anywhere within the spline item in the list
			elem.onclick = function() {
				
				//Deselect all other splines
				var others = document.getElementsByClassName("splineitem selected");
				for ( var i = 0; i < others.length; i++ )
				{
					if ( others[i] != this )
					{
						others[i].className = "splineitem";
					}
				}
				
				// Toggle selection of the current spline
				// Change the view and the splinemanager
				if ( this.className === "splineitem" )
				{
					this.className = "splineitem selected";
					mySplineManager.setActiveSpline( spl );
					
					// Fade in the edit buttons
					// editbtns.className = "editbuttons fadein";
				}
				// else
				// {
				// 	this.className = "splineitem";
				// 	mySplineManager.setActiveSpline( -1 );
				// }
			}
			
			var rightside = document.createElement("div");
			rightside.setAttribute( "style", "float: right;" );
			
			var enablebtn = document.createElement("div");
			enablebtn.className = "enablebtn";
			
			// Enable or disable the spline's rendering and the enable button
			enablebtn.onclick = function() {
				if ( this.className == "enablebtn" )
				{
					spl.hide();
					this.className = "enablebtn hidden"
				}
				else
				{
					spl.unhide();
					this.className = "enablebtn";
				}
			}
			
			var settingslink = document.createElement("a");
			var settingsbtn = document.createElement("div");
			settingslink.onclick = function() {
				// open settings for this spline here
				return false;
			}
			settingslink.href = "#settings";
			settingsbtn.className = "settingsbtn";
			settingslink.appendChild( settingsbtn );
			
			var trashlink = document.createElement("a");
			var trashbtn = document.createElement("div");
			trashbtn.onclick = function() {
				
				// delete the spline from the manager
				mySplineManager.deleteSpline( spl );
				
				// delete the element from the list
				list.removeChild( elem );
				elem = null;
				
				// Fade out the edit buttons if this spline is selected
				// editbtns.className = "editbuttons fadeout";
				
				return false;
				
			}
			trashlink.href = "#trash";
			trashbtn.className = "deletebtn";
			trashlink.appendChild( trashbtn );
			
			rightside.appendChild( enablebtn );
			rightside.appendChild( settingsbtn );
			rightside.appendChild( trashbtn );
			
			// Append other elements
			elem.appendChild( form );
			elem.appendChild( rightside );
		
			// Append to list if it exists
			if ( list != null )
			{
				list.appendChild( elem );
				fname.focus();
			}
			
			// Fade in the edit buttons
			// editbtns.className = "editbuttons fadein";
			
		});

		// Setup spline deselection when clicking in empty areas of the list
		document.getElementsByClassName("splinelist")[0].addEventListener( "click", function( e ) {
			
						
			// Return if event was from inside a splineitem node (i.e. intending to select a spline item)
			var target = e.target;
			while ( target != document )
			{
				if ( target.className.indexOf("splineitem") != -1 )
				{
					return false;
				}
				target = target.parentNode;
			}
			
			// Otherwise deselect all splines
			var others = document.getElementsByClassName("splineitem");
			for ( var i = 0; i < others.length; i++ )
			{
				others[i].className = "splineitem";
			}
			
			// Select -1 in manager
			mySplineManager.setActiveSpline( -1 );
			
			// Fade out the edit buttons
			// editbtns.className = "editbuttons fadeout";
				
		});
		
		
		// Render on window resize
		window.addEventListener( "resize", function() {
			mySplineManager.render();	
		});
		
	});
}());
