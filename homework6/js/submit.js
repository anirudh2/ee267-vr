/**
 * @file for drag-and-drop submission
 * This file is for creating a zip file containing all necessary files for
 * rendering. Students should drag-and-drop a folder containing the files they
 * edit. Since this submission system supports only Chrome, please use Chrome
 * to make a zip file for submission.
 *
 * @copyright The Board of Trustees of the Leland Stanford Junior University
 * @version 2018/03/28
 */

var submittedList = [];

var requiredFilesList = [
	"render.js", "utils.js",
	"displayParameters.js", "submit.js", "teapot.js",
	"transform.js", "standardRenderer.js", "stateController.js",
	"stereoUnwarpRenderer.js",
	"fShaderUnwarp.js", "vShaderUnwarp.js", "vShaderMultiPhong.js", "fShaderMultiPhong.js",
	"jquery-3.2.1.min.js", "JQUERY_LICENSE.txt",
	"FileSaver.min.js", "FILESAVER_LICENSE.txt",
	"jszip.min.js", "JSZIP_LICENSE.txt",
	"three-r91.min.js", "THREE_LICENSE.txt",
	"stats-r17.min.js", "STATS_LICENSE.txt",
	"TeapotBufferGeometry.js", "render.html", "style.css",
	"vrduino.ino", "Imu.cpp", "Imu.h", "OrientationMath.cpp",
	"OrientationMath.h", "OrientationTracker.cpp", "OrientationTracker.h",
	"Quaternion.h", "simulatedImuData.h", "TestOrientation.cpp",
	"TestOrientation.h", "TestUtil.cpp", "TestUtil.h",
	"InputCapture.cpp", "InputCapture.h", "Lighthouse.cpp", "Lighthouse.h",
	"LighthouseInputCapture.cpp", "LighthouseInputCapture.h",
	"LighthouseOOTX.cpp", "LighthouseOOTX.h", "MatrixMath.cpp", "MatrixMath.h",
	"PoseMath.cpp", "PoseMath.h", "simulatedLighthouseData.h",
	"PoseTracker.cpp", "PoseTracker.h", "PulseData.h", "TestPose.cpp", "TestPose.h"
];

var remainingFilesList = requiredFilesList.slice();

var submissionZip = null;

/* add one file at a time to the zip, then downloads zip when finished */
function zipFileList() {

	if ( submittedList.length === 0 ) {

		submissionZip.generateAsync( { type: "blob" } ).then(

			function ( zipFile ) {

				saveAs( zipFile, "submission.zip" );

				submissionZip = null;

			} );

		return;

	}

	var file = submittedList.pop();

	var reader = new FileReader();

	reader.onload = function ( evt ) {

		/***
		 * Doing it this way because I don't know how well the zip library
		 * handles asynchronous adding.
		 *
		 * webkitRelativePath may not be found in non-webkit browsers.
		 */
		submissionZip.file(
			file.webkitRelativePath, evt.target.result, { binary: true } );

		zipFileList();

	};

	reader.readAsBinaryString( file );

}

function submitFiles( filesList ) {

	if ( submissionZip == null ) {

		submissionZip = new JSZip();

		remainingFilesList = requiredFilesList.slice();

	}

	for ( var i = 0; i < filesList.length; i ++ ) {

		var filename = filesList[ i ].name;

		/* if in list of files required */
		if ( requiredFilesList.indexOf( filename ) != - 1 ) {

			/* add to submitted file list if new, replace otherwise */

			var replaced_file = false;

			for ( var j = 0; j < submittedList.length; j ++ ) {

				if ( submittedList[ j ].name == filename ) {

					submittedList[ j ] = filesList[ i ];

					replaced_file = true;

					break;

				}

			}

			if ( ! replaced_file ) {

				submittedList.push( filesList[ i ] );

				var ind = remainingFilesList.indexOf( filename );

				remainingFilesList.splice( ind, 1 );

			}

		}

	}

	/* forcing uniqueness and only adding required files, so this works */
	if ( remainingFilesList.length == 0 ) {

		zipFileList();

	}

}


$( "html" ).on( {

	"dragover": function ( e ) {

		$( "#submissionBox" ).text( "Drop to add file(s) to submission." );

		$( "#submit_area" ).css( "display", "block" );

	},

	"dragenter": function ( e ) {

		$( "#submissionBox" ).text( "Drop to add file(s) to submission." );

		$( "#submit_area" ).css( "display", "block" );

	},

} );


$( "#submit_area" ).on( {

	"dragover": function ( e ) {

		$( "#submissionBox" ).text( "Drop to add file(s) to submission." );

	},
	"dragenter": function ( e ) {

		$( "#submissionBox" ).text( "Drop to add file(s) to submission." );

	},

	"dragend": function ( e ) {

		$( "#submissionBox" ).html( "Remaining files:<br>" +
			remainingFilesList.toString().replace( ",", "<br>" ) );

		$( "#submit_area" ).css( "display", "none" );

	},

	"dragleave": function ( e ) {

		$( "#submissionBox" ).html( "Remaining files:<br>" +
			remainingFilesList.toString().replace( ",", "<br>" ) );

		$( "#submit_area" ).css( "display", "none" );

	},

	"dragexit": function ( e ) {

		$( "#submissionBox" ).html( "Remaining files:<br>" +
			remainingFilesList.toString().replace( ",", "<br>" ) );

		$( "#submit_area" ).css( "display", "none" );

	},

	"change": function ( e ) {

		var evt = e.originalEvent;

		var files = evt.target.files;

		submitFiles( files );

		$( "#submissionBox" ).html( "Remaining files:<br>" +
			remainingFilesList.toString().replace( ",", "<br>" ) );

		$( "#submit_area" ).css( "display", "none" );

		$( "#submit_area" )[ 0 ].value = "";

	},

	"drop": function ( e ) {

		var evt = e.originalEvent;

		var files = evt.dataTransfer.files;

		submitFiles( files );

		$( "#submissionBox" ).html( "Remaining files:<br>" +
			remainingFilesList.toString().replace( ",", "<br>" ) );

		$( "#submit_area" ).css( "display", "none" );

		$( "#submit_area" )[ 0 ].value = "";

	},

} );
