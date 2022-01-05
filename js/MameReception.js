/*
	MameReception.js
*/
window.mr = ( function( mr, $, JSON, undefined ){
	//"use strict";

	/* const */
	var ALERT_STATUS_SUCCESS = "success";
	var ALERT_STATUS_DANGER = "danger";
	var ALERT_STATUS_WARNING = "warning";

	var MSG_ADD_WORK_COMPLETE = "作業を登録しました。";
	var MSG_EDIT_WORK_COMPLETE = "作業を修正しました。";
	var MSG_REMOVE_WORK_COMPLETE = "作業【id】を削除しました。";

	var MSG_ADD_CALL_COMPLETE = "通話記録【id】を登録しました。";
	var MSG_REMOVE_CALL_COMPLETE = "通話記録【id】を削除しました。";

	/* private */
	var _privateMethod = function(){/* ... */};

	/************************************************************************************/

	/*
		addWork( event )
		作業情報を追加する。
	*/
	mr.addWork = function(e){
		var form = $("#form_workinput"),
		    wl = $("#worklist"),
		    wi = $("#workinput"),
		    serializedFormdata = form.serializeObject(),
		    msg_complete = MSG_ADD_WORK_COMPLETE,
		    reg_id = /id/;

		e.preventDefault();

		// todo : check input form

		if ( !mr.validateWorkInput() ) {
			return;
		}

		$.ajax( form.attr("action") + "?method=addWork", {
			data: {
				formdata: JSON.stringify( serializedFormdata )
			},
			type: "POST",
			datatype: "json",
			beforeSend: function(){
				console.log( "add work" );
				console.log( serializedFormdata );
			},
			success: function(response){
				try{
					wl.find(".refresh").trigger("click.refresh");
					if ( typeof $.parseJSON( response ) === "object" ){
						mr.displayMsg( ALERT_STATUS_SUCCESS, msg_complete );
						wi.modal("hide");
					} else {
						mr.displayMsg( ALERT_STATUS_DANGER, response );
					}
				} catch(e) {
					console.log( response );
					mr.displayMsg( ALERT_STATUS_DANGER, response );
				}
			},
			error: function( jqXHR, textStatus ){
				mr.displayMsg( ALERT_STATUS_DANGER, jqXHR.responseText );
				console.log(jqXHR.responseText);
			}
		} );
	};

	/*
		updateWork( event )
		作業を更新する。
	*/
	mr.updateWork = function( event ) {
		var form = $("#form_workinput"),
		    wl = $("#worklist"),
		    wi = $("#workinput"),
		    serializedFormdata = form.serializeObject();

		// todo : check input form

		$.ajax( form.attr("action") + "?method=updateWork", {
			data: {
				formdata: JSON.stringify( serializedFormdata )
			},
			type: "POST",
			datatype: "json",
			beforeSend: function(){
				console.log( "update work: " );
				console.log( serializedFormdata );
			},
			success: function( response ){
				try{
					wl.find(".refresh").trigger("click.refresh");
					if ( typeof $.parseJSON( response ) === "object" ){
						mr.displayMsg( ALERT_STATUS_SUCCESS, MSG_EDIT_WORK_COMPLETE );
						wi.modal("hide");
					} else {
						mr.displayMsg( ALERT_STATUS_DANGER, response );
					}
				} catch(e) {
					console.log( response );
					mr.displayMsg( ALERT_STATUS_DANGER, response );
				}
			},
			error: function( jqXHR, textStatus ){
				mr.displayMsg( ALERT_STATUS_DANGER, jqXHR.responseText );
				console.log(jqXHR.responseText);
			}
		} );
	};

	/*
		editWork( event )
		作業を修正する。
	*/
	mr.editWork = function( event ){
		var form = $("#form_workinput"),
		    wi = $("#workinput"),
		    eventData = event.data || {},
		    workPromise = mr.getWorkPromise( eventData.id || 0 );

		mr.emptyMsg( "wi" );
		wi.find("input,textarea").removeClass("bgcolor_danger");

		workPromise.done( function( response ){
				try{
					var result = $.parseJSON( response );
					// console.log( result );

					// set inputwork title
					wi.find(".modal-title").text("作業修正");
					
					// set inputwork event
					wi.unbind("click.send");
					wi.on( "click.send", ".send", window.mr.updateWork );
					//window.mr.setReqPersons();

					// set inputwork form
					wi.find("#datepicker_start").val( result.data.work_tx_date_start ); // 発生日時
					wi.find("#datepicker_demand").val( result.data.work_tx_date_demand ); // 納期
					wi.find("#datepicker_end").val( result.data.work_tx_date_end ); // 回復日時
					$.each( wi.find("input[name=work_rb_branch]"), function( i, el ){ // 拠点
						if( el.value == result.data.work_rb_branch ) el.checked = "true";
					} );
					wi.find("#personRequestText").val( result.data.work_tx_person_request ); // 発信元
					wi.find("#personInChargeSelect").val( result.data.work_sl_person_in_charge ); // 担当者
					wi.find("#worktypeSelect").val( result.data.work_sl_type ); // 分類
					wi.find("#originLocationSelect").val( result.data.work_sl_origin_location ); // 原因所在
					wi.find("#originSystemSelect").val( result.data.work_sl_origin_system ); // 対象分類
					wi.find("#workTitleText").val( result.data.work_tx_title ); // タイトル
					wi.find("#workDetailTextarea").val( result.data.work_ta_detail ); // 内容
					wi.find("#workManageTextarea").val( result.data.work_ta_manage ); // 対処
					wi.find("#workCommentTextarea").val( result.data.work_ta_comment ); // コメント
					wi.find("#workTimeText").val( result.data.work_tx_work_time ); // 作業時間
					$.each( wi.find("input[name=work_rb_status]"), function( i, el ){ // 状況
						if( el.value == result.data.work_rb_status ) el.checked = "true";
					} );
					$.each( wi.find("input[name=work_rb_flag_report]"), function( i, el ){ // 月次
						if( el.value == result.data.work_rb_flag_report ) el.checked = "true";
					} );
					$.each( wi.find("input[name=work_rb_final_check]"), function( i, el ){ // 最終確認
						if( el.value == result.data.work_rb_final_check ) el.checked = "true";
					} );
					wi.find("#workIdHidden").val( result.data.work_id ); // id

					// trigger show
					wi.modal({show:true, keyboard:false, backdrop:'static'});

				} catch (e) {
					mr.displayMsg( ALERT_STATUS_DANGER, response );
					console.log( e );
				}
			}
		).fail( function( jqXHR, textStatus ){
			mr.displayMsg( ALERT_STATUS_DANGER, jqXHR.responseText );
		});

	};

	/*
		removeWork()
		作業を削除する。
	*/
	mr.removeWork = function( event ) {
		var form = $("#form_workinput"),
		    msg_complete = MSG_REMOVE_WORK_COMPLETE,
		    reg_id = /id/;
		if( confirm("作業【" + event.data.id + "】を削除します。") ) {
			$.ajax( form.attr("action") + "?method=removeWork", {
				data: {
					removeId: event.data.id
				},
				type: "post",
				beforeSend: function(){
					console.log( "remove id." + event.data.id );
				},
				success: function( response ){
					$("#worklist").find(".refresh").trigger("click.refresh");
					if ( typeof $.parseJSON( response ) === 'object' ){
						mr.displayMsg( ALERT_STATUS_SUCCESS, msg_complete.replace( reg_id, event.data.id ) );
					} else {
						mr.displayMsg( ALERT_STATUS_DANGER, response );
					}
					console.log(response);
				},
				error: function( jqXHR, textStatus, errorThrown ){
					console.log(jqXHR);
					mr.displayMsg( ALERT_STATUS_DANGER, textStatus );
				}
			});
		}
	};

	/*
		getWorkPromise(id)
	*/
	mr.getWorkPromise = function( id ) {
		var form = $("#form_workinput"),
		    promise = $.ajax( form.attr("action"), {
				data: {
					method: "getWork",
					id: id || 0
				},
				beforeSend: function(){
					console.log("getWork id: " + id || 0 );
				}
		    });
		return promise;
	};

	/*
		showWorkDetail()
		作業作詳細をダイアログ(#workdetailModal)に表示する。
	*/
	mr.showWorkDetail = function( event ){
		var wd = $("#workdetail"),
		    eventData = event.data || {},
		    workPromise = mr.getWorkPromise( eventData.id || 0 );

		workPromise.done( function( response ){
			var result = $.parseJSON( response ),
			    str_flag_report = ( result.data.work_rb_flag_report === 1 ) ? "○" : "☓" ;

			wd.find(".modal-title").text( "【" + result.data.work_id + "】" + result.data.work_tx_title );
			wd.find(".work-date-start").text( result.data.work_tx_date_start );
			wd.find(".work-date-demand").text( result.data.work_tx_date_demand );
			wd.find(".work-date-end").text( result.data.work_tx_date_end );
			wd.find(".work-branch").text( result.data.work_rb_branch );
			wd.find(".work-person-request").text( result.data.work_tx_person_request );
			wd.find(".work-person-in-charge").text( result.data.work_sl_person_in_charge );
			wd.find(".work-type").text( result.data.work_sl_type );
			wd.find(".work-origin-location").text( result.data.work_sl_origin_location );
			wd.find(".work-origin-system").text( result.data.work_sl_origin_system );
			//wd.find(".work-title").text( result.data.work_tx_title );
			wd.find(".work-detail").text( result.data.work_ta_detail );
			wd.find(".work-manage").text( result.data.work_ta_manage );
			wd.find(".work-comment").text( result.data.work_ta_comment );
			wd.find(".work-time").text( result.data.work_tx_work_time );
			wd.find(".work-status").text( result.data.work_rb_status );
			wd.find(".work-flag-report").text( str_flag_report );
			wd.find(".work-final-check").text( result.data.work_rb_final_check_string );
			//wd.find(".work-id-notes").text( result.data.work_id_notes );
			wd.find(".work-writer-ip").text( result.data.work_hn_ip );
			wd.find(".work-insert-date").text( result.data.work_hn_insert_date );
			wd.find(".work-update-date").text( result.data.work_hn_update_date );
		} );

		wd.modal({show:true, keyboard:false, backdrop:'static'});
		//wd.modal("show");
	};

	/*
		refreshWorkList()
		作業一覧を更新する。
	*/
	mr.refreshWorkList = function( event ) {
		var form = $("#form_workinput"),
		    wl   = $("#worklist"),
		    pn   = wl.find(".pagination"),
		    csvBtn = wl.find(".csv"),
		    loadingImg = $("<img/>").attr("src","img/ajax-loader.gif"),
		    eventData = event.data || {},
		    currentPageno = wl.data("currentPageno") || 1,
		    rowsPerPage = wl.data("rowsperpage") || 20,
		    sortcolname = wl.data("sortcolname") || "id",
		    sortorder = wl.data("sortorder") || "desc",
		    searchtype = wl.data("searchtype") || "detail", // 検索基本項目を「内容」にする。
		    searchtext = wl.data("searchtext") || "",
		    searchdatestart = wl.data("searchdatestart") || "",
		    searchdateend = wl.data("searchdateend") || "",
		    searchstatus = wl.data("searchstatus") || ["発生","中間","済"],
		    searchreportflag = wl.data("searchreportflag") || [1,0];
		
		$.ajax( form.attr("action"), {
			data:{
				method: "getList",
				pageno: eventData.pageno || currentPageno,
				rowsPerPage: rowsPerPage,
				sortcolname: sortcolname,
				sortorder: sortorder,
				searchtype: searchtype,
				searchtext: searchtext,
				searchdatestart: searchdatestart,
				searchdateend: searchdateend,
				searchstatus: searchstatus,
				searchreportflag: searchreportflag,
			},
			beforeSend: function(){
				//console.log( wl.data() );
				wl.find(".loadingImg").empty().append( loadingImg );
				wl.block({message:null});
			},
			success: function(data){
				try{
					var result = $.parseJSON( data ),
					    list = result.worklist,
					    i,tr,th,td,button,span,
					    statusClass;
					
					// console.log(result);

					// empty
					wl.find("tbody").empty();
					pn.empty();

					// tbody
					for( i = 0; i < list.recordcount; i++ ){
						if ( list.data.STATUS[i] == "済" ) statusClass = ALERT_STATUS_SUCCESS;
						else if ( list.data.STATUS[i] == "発生" ) statusClass = ALERT_STATUS_DANGER;
						else if ( list.data.STATUS[i] == "中間" ) statusClass = "warning";
						else statusClass = "";

						// 最終確認
						if ( list.data.FINAL_CHECK[i] == "確認済" ) finalcheckClass = ALERT_STATUS_SUCCESS;
						else if ( list.data.FINAL_CHECK[i] == "未確認" ) finalcheckClass = ALERT_STATUS_DANGER;
						else finalcheckClass = "";

						tr = $("<tr>");
						
						tr.append( $("<td>").addClass("work-no text-center").text( list.data.ID[i] ) );
						tr.append( $("<td>").addClass("work-date-start text-center").text( list.data.DATE_START[i] ) );
						tr.append( $("<td>").addClass("work-date-end text-center").text( list.data.DATE_END[i] ) );
						tr.append( $("<td>").addClass("work-branch text-center").text( list.data.BRANCH[i] ) );
						tr.append( $("<td>").addClass("work-person-request text-center").text( list.data.PERSON_REQUEST[i] ) );
						tr.append( $("<td>").addClass("work-person-in-charge text-center").text( list.data.PERSON_IN_CHARGE[i] ) );
						tr.append( $("<td>").addClass("work-type").text( list.data.TYPE[i] ) );
						tr.append( $("<td>").addClass("work-title").append( $("<pre></pre>").text( list.data.TITLE[i].toString() ) ) );
						tr.append( $("<td>").addClass("work-detail").append( $("<pre></pre>").text( list.data.DETAIL[i].toString() ) ) );
						tr.append( $("<td>").addClass("work-status text-center").text( list.data.STATUS[i] ).addClass( statusClass ) );
						tr.append( $("<td>").addClass("work-flag-report text-center").text( list.data.FLAG_REPORT[i] ) );
						tr.append( $("<td>").addClass("work-final-check text-center").text( list.data.FINAL_CHECK[i] ).addClass( finalcheckClass ) );

						td = $("<td>").addClass("work-ctrl text-center");

						// detail button
						button = $("<button>").addClass("btn btn-default btn-xs showDetail");
						button.data( "id", list.data.ID[i] );
						button.append( $("<span>").addClass("glyphicon glyphicon-list-alt") );
						button.on( "click", {id:list.data.ID[i]}, window.mr.showWorkDetail );
						button.attr("title","詳細表示");
						button.appendTo( td );

						// edit button						
						button = $("<button>").addClass("btn btn-default btn-xs edit");
						button.data( "id", list.data.ID[i] );
						button.append( $("<span>").addClass("glyphicon glyphicon-edit") );
						button.on( "click", {id:list.data.ID[i]}, window.mr.editWork );
						button.attr("title","修正");
						button.appendTo( td );

						// remove button
						button = $("<button>").addClass("btn btn-default btn-xs remove");
						button.data( "id", list.data.ID[i] );
						button.append( $("<span>").addClass("glyphicon glyphicon-trash") );
						button.on( "click", {id: list.data.ID[i]}, window.mr.removeWork );
						button.attr("title","削除");
						button.appendTo( td );

						tr.append( td );

						wl.find("tbody").append( tr );
					}

					// pagination
					mr.displayPagination( result.rowstotal, wl.data("rowsperpage"), result.currentpageno );

					// set page data
					wl.data( "sortcolname", sortcolname );
					wl.data( "sortorder", sortorder );
					wl.data( "searchtype", searchtype);
					wl.data( "currentPageno", result.currentpageno );
					wl.data( "searchstatus", searchstatus );
					wl.find(".pageInfo").empty().append( $("<span></span>").text( "Total " + result.rowstotal + " records, " + wl.data( "pagesTotal" ) + " pages" ) );
					wl.find(".select-rows").val( rowsPerPage );

					// enable/disable csv button
					if( result.rowstotal <= 0 ){
						csvBtn.attr("disabled","true");
					} else {
						csvBtn.removeAttr("disabled");
					}

				} catch( e ){
					mr.displayMsg( ALERT_STATUS_DANGER, data );
					console.log( e );
				}
			},
			error:function( jqXHR, textStatus, errorThrown ){
				mr.displayMsg( ALERT_STATUS_DANGER, jqXHR.responseText );
			},
			complete: function( jqXHR, textStatus ){
				loadingImg.detach();
				wl.find(".loadingImg").text("refresh");
				wl.unblock();
			}
		});

	};

	mr.displayPagination = function( rowsTotal, rowsPerPage, currentPageno ){
		var wl = $("#worklist"),
		    pn = wl.find(".pagination"),
		    i, pagesTotal, pageStart, pageEnd,
		    temp_li, temp_a;

		// set pagesTotal
		if ( rowsTotal % rowsPerPage > 0 ){
			pagesTotal = Math.floor( rowsTotal / rowsPerPage + 1 );
		} else {
			pagesTotal = Math.floor( rowsTotal / rowsPerPage );
		}
		wl.data( "pagesTotal", pagesTotal );

		pageStart = currentPageno - 5;
		if( pageStart < 1 ) pageStart = 1;

		pageEnd = currentPageno + 4;
		if( pageEnd > pagesTotal ) pageEnd = pagesTotal;

		// prev
		temp_li = $("<li></li>");
		temp_a = $("<a></a>").attr("href","#").text( "<" );
		if( currentPageno <= 1 ) {
			temp_li.addClass("disabled");
		}
		else {
			temp_a.on( "click", {pageno: currentPageno - 1}, mr.refreshWorkList );
		}
		pn.append( temp_li.append( temp_a ) );

		// first page
		if( pageStart > 1 ){
			temp_li = $("<li></li>");
			temp_a = $("<a></a>").attr("href","#").text( "1" );
			temp_a.on( "click", {pageno: 1}, mr.refreshWorkList );
			pn.append( temp_li.append( temp_a ) );
			temp_li = $("<li></li>").addClass("disabled");

			temp_a = $("<a></a>").attr("href","#").text( "…" );
			pn.append( temp_li.append( temp_a ) );
		}

		// pagination main
		for( i = pageStart ; i <= pageEnd; i++ ){
			temp_li = $("<li></li>");
			temp_a = $("<a></a>").attr("href","#").text( i );

			if( i == currentPageno ) temp_li.addClass("active");

			temp_a.on( "click", {pageno: i}, mr.refreshWorkList );

			pn.append( temp_li.append( temp_a ) );
		}

		// last page
		if( pageEnd < pagesTotal ){
			temp_li = $("<li></li>").addClass("disabled");
			temp_a = $("<a></a>").attr("href","#").text( "…" );
			pn.append( temp_li.append( temp_a ) );

			temp_li = $("<li></li>");
			temp_a = $("<a></a>").attr("href","#").text( pagesTotal );
			temp_a.on( "click", {pageno: pagesTotal}, mr.refreshWorkList );
			pn.append( temp_li.append( temp_a ) );
		}

		// next
		temp_li = $("<li></li>");
		temp_a = $("<a></a>").attr("href","#").text( ">" );
		if( currentPageno >= pagesTotal ) {
			temp_li.addClass("disabled");
		} else {
			temp_a.on( "click", {pageno: currentPageno + 1}, mr.refreshWorkList );
		}
		pn.append( temp_li.append( temp_a ) );
	};

	mr.displayPagination_mc = function( rowsTotal, rowsPerPage, currentPageno ){
		var cl = $("#calllist"),
		    pn = cl.find(".pagination"),
		    i, pagesTotal, pageStart, pageEnd,
		    temp_li, temp_a;

		// set pagesTotal
		if ( rowsTotal % rowsPerPage > 0 ){
			pagesTotal = Math.floor( rowsTotal / rowsPerPage + 1 );
		} else {
			pagesTotal = Math.floor( rowsTotal / rowsPerPage );
		}
		cl.data( "pagesTotal", pagesTotal );

		pageStart = currentPageno - 5;
		if( pageStart < 1 ) pageStart = 1;

		pageEnd = currentPageno + 4;
		if( pageEnd > pagesTotal ) pageEnd = pagesTotal;

		// prev
		temp_li = $("<li></li>");
		temp_a = $("<a></a>").attr("href","#").text( "<" );
		if( currentPageno <= 1 ) {
			temp_li.addClass("disabled");
		}
		else {
			temp_a.on( "click", {pageno: currentPageno - 1}, mr.refreshCallList );
		}
		pn.append( temp_li.append( temp_a ) );

		// first page
		if( pageStart > 1 ){
			temp_li = $("<li></li>");
			temp_a = $("<a></a>").attr("href","#").text( "1" );
			temp_a.on( "click", {pageno: 1}, mr.refreshCallList );
			pn.append( temp_li.append( temp_a ) );
			temp_li = $("<li></li>").addClass("disabled");

			temp_a = $("<a></a>").attr("href","#").text( "…" );
			pn.append( temp_li.append( temp_a ) );
		}

		// pagination main
		for( i = pageStart ; i <= pageEnd; i++ ){
			temp_li = $("<li></li>");
			temp_a = $("<a></a>").attr("href","#").text( i );

			if( i == currentPageno ) temp_li.addClass("active");

			temp_a.on( "click", {pageno: i}, mr.refreshCallList );

			pn.append( temp_li.append( temp_a ) );
		}

		// last page
		if( pageEnd < pagesTotal ){
			temp_li = $("<li></li>").addClass("disabled");
			temp_a = $("<a></a>").attr("href","#").text( "…" );
			pn.append( temp_li.append( temp_a ) );

			temp_li = $("<li></li>");
			temp_a = $("<a></a>").attr("href","#").text( pagesTotal );
			temp_a.on( "click", {pageno: pagesTotal}, mr.refreshCallList );
			pn.append( temp_li.append( temp_a ) );
		}

		// next
		temp_li = $("<li></li>");
		temp_a = $("<a></a>").attr("href","#").text( ">" );
		if( currentPageno >= pagesTotal ) {
			temp_li.addClass("disabled");
		} else {
			temp_a.on( "click", {pageno: currentPageno + 1}, mr.refreshCallList );
		}
		pn.append( temp_li.append( temp_a ) );
	};

	/*
		displayMsg( [ALERT_STATUS_SUCCESS; "info"; "warning"; ALERT_STATUS_DANGER], string msg )
		メッセージを表示する。
	*/
	mr.displayMsg = function( type, msg, target ){
		var divErrMsg,
		    spanMsg = $("<span></span>").addClass("msgText").html( msg );
		
		if ( !target || target === '' ) {
			divErrMsg = $("#div_errMsg");
		} else if ( target === "wi" ) {
			divErrMsg = $("#div_errMsg_wi");
		} else {
			console.log("error: unknown target for message.");
		}

		mr.emptyMsg( target );
		divErrMsg.addClass( "alert alert-dismissable alert-" + type );
		divErrMsg.append( spanMsg );
		divErrMsg.show();
	};

	/*
		emptyMsg()
	*/
	mr.emptyMsg = function( target ){
		var divErrMsg;

		if ( !target || target === '' ) {
			divErrMsg = $("#div_errMsg");
		} else if ( target === "wi" ) {
			divErrMsg = $("#div_errMsg_wi");
		} else {
			console.log("error: unknown target for message.");
		}

		divErrMsg.find(".msgText").detach();
		divErrMsg.attr( "class", "" );
	};

	/*
		initDatepicker()
		発生日時、回復日時のdatepickerを初期化
	*/
	mr.initDatepicker = function(){
		var dt = new Date(),
		    today = dt.getFullYear() + "/" + ( dt.getMonth() + 1 ) + "/" + dt.getDate();
		
		// jquery datepicker
		$.datepicker.setDefaults( { dateFormat:"yy/mm/dd" } );
		$(".datepicker").datepicker();
		$("#datepicker_start").datepicker( "setDate", today );
	};

	/*
		setReqPersons()
	*/
	mr.setReqPersons = function(){
		$.ajax( $("#form_workinput").attr("action") + "?method=getReqPersons", {
			success: function( response ){
				var result = $.parseJSON( response );
				console.log( result );
				$("#personRequestText").typeahead({
					name: "reqPersons",
					local: result.reqpersons,
					limit: 10
				});
			},
			error: function( jqXHR ){
				mr.displayMsg( ALERT_STATUS_DANGER, jqXHR.responseText );
			}
		});
	};

	/*
		getCSV()
	*/
	mr.getCSV = function(){
		// todo : get list condition

		// open popup
		window.open( $("#form_workinput").attr("action") + "?method=getCSV" );
	};

	/*
		isValidData()
	*/
	mr.isValidData = function( re, data ){
		return re.test(data);
	};

	/*
		validate work input
	*/
	mr.validateWorkInput = function(){
		var workManage = $("#workManageTextarea"),
		    workTime = $("#workTimeText"),
		    workDateEnd = $("#datepicker_end"),
		    msg = "",
		    re_numbers = /^[0-9]+$/;

		if ( $("input[name='work_rb_status']:checked").val() === "済" ) {
			if ( workManage.val().trim() === "" ) {
				msg += "「対処」";
				workManage.addClass("bgcolor_danger");
			}
			if ( workTime.val().trim() === "" ) {
				msg += "「作業時間」";
				workTime.addClass("bgcolor_danger");
			}
			if ( workDateEnd.val().trim() === "" ) {
				msg += "「回復日時」";
				workTime.addClass("bgcolor_danger");
			}

			if ( msg !== "" ) {
				msg += "を入力してください。";
			}
		}

		if ( workTime.val().trim() !== "" && !mr.isValidData( re_numbers, workTime.val() ) ) {
			if ( msg !== "" ) {
				msg += "<br/>";
			}
			msg += "「作業時間」には半角数字のみ入力ください。";
			workTime.addClass("bgcolor_danger");
		}
		
		if ( msg !== "" ) {
			mr.displayMsg( ALERT_STATUS_DANGER, msg, "wi" );
			return false;
		}

		return true;
	};

	/*****************************************************************************************************/

	/*
		getCustomerList()
		顧客一覧を更新する。
	*/
	mr.getCustomerList = function() {
		var form = $("#form_workinput"),
		    cl   = $("#customerlist");
		
		$.ajax( form.attr("action"), {
			data:{
				method: "getCustomerList"
			},
			beforeSend: function(){
				//console.log( cl.data() );
			},
			success: function(data){
				try{
					var result = $.parseJSON( data ),
					    list = result.customerlist,
					    i,tr,th,td,button,span;
					
					//console.log(result);

					// empty
					cl.find("tbody").empty();

					// tbody
					for( i = 0; i < list.recordcount; i++ ){

						tr = $("<tr>");

						tr.append( $("<td>").addClass("customer-id").text( list.data.CUSTOMER_ID[i] ) );
						tr.append( $("<td>").addClass("customer-company").text( list.data.COMPANY[i] ) );
						tr.append( $("<td>").addClass("customer-name").text( list.data.CUSTOMER_NAME[i] ) );
						tr.append( $("<td>").addClass("customer-name-yomi").text( list.data.CUSTOMER_NAME_YOMI[i] ) );
						tr.append( $("<td>").addClass("customer-branch").text( list.data.BRANCH[i] ) );
						tr.append( $("<td>").addClass("customer-department").text( list.data.DEPARTMENT[i] ) );
						tr.append( $("<td>").addClass("customer-position").text( list.data.POSITION[i] ) );
						tr.append( $("<td>").addClass("customer-tel").text( list.data.TEL[i] ) );

						cl.find("tbody").append( tr );
					}

				} catch( e ){
					mr.displayMsg( ALERT_STATUS_DANGER, data );
					console.log( e );
				}
			},
			error:function( jqXHR, textStatus, errorThrown ){
				mr.displayMsg( ALERT_STATUS_DANGER, jqXHR.responseText );
			},
			complete: function( jqXHR, textStatus ){
			}
		});

	};

	/*****************************************************************************************************/

	/*
		refreshCallList()
	*/
	mr.refreshCallList = function( event ) {
		var form = $("#form_call"),
		    cl = $("#calllist"),
		    pn = cl.find(".pagination"),
		    eventData = event.data || {},
		    currentPageno = cl.data("currentPageno") || 1,
		    rowsPerPage = cl.data("rowsperpage") || 10,
		    loadingImg = $("<img/>").attr("src","img/ajax-loader.gif");
		
		$.ajax( form.attr("action"), {
			data:{
				method: "getList",
				pageno: eventData.pageno || currentPageno,
				rowsPerPage: rowsPerPage
			},
			beforeSend: function(){
				//console.log( cl.data() );
				cl.find(".loadingImg").empty().append( loadingImg );
				cl.block({message:null});
			},
			success: function(data){
				try{
					var result = $.parseJSON( data ),
					    list = result.calllist,
					    i,tr,th,td,button,span;
					
					// console.log(result);

					// empty
					cl.find("tbody").empty();
					pn.empty();

					// tbody
					for( i = 0; i < list.recordcount; i++ ){

						tr = $("<tr>");

						tr.append( $("<td>").addClass("call-id text-center").text( list.data.ID[i] ) );
						tr.append( $("<td>").addClass("call-timeend text-center").text( list.data.TIME_END[i] ) );
						tr.append( $("<td>").addClass("call-duration text-center").text( list.data.DURATION[i] ) );
						tr.append( $("<td>").addClass("call-personcall text-center").text( list.data.PERSON_CALL[i] ) );
						tr.append( $("<td>").addClass("call-persontake text-center").text( list.data.PERSON_TAKE[i] ) );
						tr.append( $("<td>").addClass("call-comment").text( list.data.COMMENT[i] ) );
						tr.append( $("<td>").addClass("call-idwork text-center")
							.append( $("<a></a>")
								.attr("href","#")
								.on( "click",{id:list.data.ID_WORK[i]}, window.mr.showWorkDetail )
								.text( list.data.ID_WORK[i] ) )
						);

						td = $("<td>").addClass("call-ctrl text-center");

						// edit button
						/*button = $("<button>").addClass("btn btn-default btn-xs edit-call");
						button.data( "id", list.data.ID[i] );
						button.append( $("<span>").addClass("glyphicon glyphicon-edit") );
						button.on( "click", {id:list.data.ID[i]}, window.mr.editCall );
						button.attr("title","修正");
						button.appendTo( td );*/

						// remove button
						button = $("<button>").addClass("btn btn-default btn-xs remove-call");
						button.data( "id", list.data.ID[i] );
						button.append( $("<span>").addClass("glyphicon glyphicon-trash") );
						button.on( "click", {id:list.data.ID[i]}, window.mr.removeCall );
						button.attr("title","削除");
						button.appendTo( td );

						tr.append( td );
						
						cl.find("tbody").append( tr );
					}

					// pagination
					mr.displayPagination_mc( result.rowstotal, cl.data("rowsperpage"), result.currentpageno );

					// set page data
					cl.data( "currentPageno", result.currentpageno );
					cl.find(".pageInfo").empty().append( $("<span></span>").text( "Total " + result.rowstotal + " records, " + cl.data( "pagesTotal" ) + " pages" ) );

					// refresh call statistics
					mr.refreshCallStatistics(event);

				} catch( e ){
					mr.displayMsg( ALERT_STATUS_DANGER, data );
					console.log( e );
				}
			},
			error: function( jqXHR, textStatus, errorThrown ){
				//mr.displayMsg( ALERT_STATUS_DANGER, jqXHR.responseText );
			},
			complete: function( jqXHR, textStatus ){
				loadingImg.detach();
				cl.find(".loadingImg").text("refresh");
				cl.unblock();
			}
		});

	};

	/*
		addCall()
	*/
	mr.addCall = function( event ) {
		var form = $("#form_call"),
		    cl = $("#calllist"),
		    serializedFormdata = form.serializeObject(),
		    now = new Date(),
		    msg_complete = MSG_ADD_CALL_COMPLETE,
		    reg_id = /id/;

		event.preventDefault();

		$.ajax( form.attr("action") + "?method=addCall", {
			data: {
				formdata: JSON.stringify( serializedFormdata ),
				timestamp: now.getFullYear() + "/" + ( now.getMonth() + 1 ) + "/" + now.getDate() + " " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds()
			},
			type: "POST",
			datatype: "json",
			beforeSend: function(){
				console.log( "function : mr.addCall()" );
			},
			success: function(response){
				var result = $.parseJSON( response );
				try{
					cl.find(".refresh").trigger("click.refresh");
					mr.initCallInput();

					if ( typeof $.parseJSON( response ) === "object" ){
						mr.displayMsg( ALERT_STATUS_SUCCESS, msg_complete.replace( reg_id, result.id ) );
					} else {
						mr.displayMsg( ALERT_STATUS_DANGER, response );
					}
				} catch(e) {
					console.log( response );
					mr.displayMsg( ALERT_STATUS_DANGER, response );
				}
			},
			error: function( jqXHR, textStatus ){
				mr.displayMsg( ALERT_STATUS_DANGER, jqXHR.responseText );
				console.log(jqXHR.responseText);
			}
		} );
	};

	/*
		editCall()
	*/
	mr.editCall = function( event ) {
		var form = $("#form_call");
		alert("通話ID." + event.data.id + "を修正します。");
	};

	/*
		removeCall()
	*/
	mr.removeCall = function( event ) {
		var form = $("#form_call"),
		    cl = $("#calllist"),
		    msg_complete = MSG_REMOVE_CALL_COMPLETE,
		    reg_id = /id/;

		if( confirm("通話記録ID." + event.data.id + "を削除します。") ) {
			$.ajax( form.attr("action") + "?method=removeCall", {
				data: {
					removeId: event.data.id
				},
				type: "post",
				beforeSend: function(){
					console.log( "remove call id." + event.data.id );
				},
				success: function( response ){
					cl.find(".refresh").trigger("click.refresh");
					if ( typeof $.parseJSON( response ) === 'object' ){
						mr.displayMsg( ALERT_STATUS_SUCCESS, msg_complete.replace( reg_id, event.data.id ) );
					} else {
						mr.displayMsg( ALERT_STATUS_DANGER, response );
					}
					//console.log(response);
				},
				error: function( jqXHR, textStatus, errorThrown ){
					console.log(jqXHR);
					mr.displayMsg( ALERT_STATUS_DANGER, textStatus );
				}
			});
		}
	};

	/*
		initCallInput()
	*/
	mr.initCallInput = function( event ) {
		var form = $("#form_call");

		form.find(".init").val("");
	};

	/*
		initSelectCallTime()
	*/
	mr.initSelectCallTime = function() {
		var sl = $("#selectCallTime"),
		    option,
		    max = 120,
		    i;

		for ( i = 1; i <= max; i++ ) {
			option = $("<option>").val(i).text( i + "分" );
			sl.append( option );
		}
	};

	/*
		refreshCallStatistics()
	*/
	mr.refreshCallStatistics = function( event ) {
		var form = $("#form_call"),
		    cs = $("#calllist-statistics"),
		    now = new Date(),
		    yearmonth = event.target.value || now.getFullYear().toString() + "/" + ( now.getMonth() + 1 ).toString();
		
		$.ajax( form.attr("action"), {
			data:{
				method: "getCallStatistics",
				year: yearmonth.split("/")[0],
				month: yearmonth.split("/")[1]
			},
			beforeSend: function(){
			},
			success: function(data){
				try{
					var result = $.parseJSON( data ),
					    list = result.callstatistics,
					    i,tr,th,td,button,span;
					
					// empty
					cs.find("tbody").empty();

					// tbody
					for( i = 0; i < list.recordcount; i++ ){

						tr = $("<tr>");

						tr.append( $("<td>").addClass("call-statistics-personcall text-center").text( list.data.PERSON_CALL[i] ) );
						tr.append( $("<td>").addClass("call-statistics-persontake text-center").text( list.data.PERSON_TAKE[i] ) );
						tr.append( $("<td>").addClass("call-statistics-cnt text-center").text( list.data.CNT[i] ) );
						tr.append( $("<td>").addClass("call-statistics-sod text-center").text( list.data.SOD[i] ) );

						cs.find("tbody").append( tr );
					}

				} catch( e ){
					mr.displayMsg( ALERT_STATUS_DANGER, data );
					console.log( e );
				}
			},
			error: function( jqXHR, textStatus, errorThrown ){
				mr.displayMsg( ALERT_STATUS_DANGER, jqXHR.responseText );
			},
			complete: function( jqXHR, textStatus ){
			}
		});		
	};


	return mr;
})( window.mr || {}, $, JSON );

/* 
	from stackoverflow.com
	http://stackoverflow.com/questions/1184624/convert-form-data-to-js-object-with-jquery
*/
$.fn.serializeObject = function()
{
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

$(document).ready(function(){
	var wl = $("#worklist"),
	    wi = $("#workinput"),
	    wd = $("#workdetail"),
	    cl = $("#calllist");

	var RE_DATE = /^2\d{3}\/(1[012]|0\d)\/(0[1-9]|[12]\d|3[01])$/;

	/********************
		assign event
	********************/

	// refreshボタンクリック時、作業一覧を更新
	wl.on( "click.refresh", ".refresh", window.mr.refreshWorkList );

	// 作業追加・修正modalのclose時、日時を初期化
	wi.on( "hidden.bs.modal", function(e){
		$("#form_workinput").trigger("reset");
		mr.initDatepicker();
	});

	// 作業追加ボタン（add）クリック時、modalのタイトルを修正
	// 作業追加modalのsendボタンクリック時、作業追加処理
	wl.find( ".addwork" ).on( "click.addwork", function(){
		wi.find( ".modal-title" ).text( "作業追加" );
		wi.unbind( "click.send" );
		wi.on( "click.send", ".send", window.mr.addWork );
		mr.emptyMsg( "wi" );
		wi.find("input,textarea").removeClass("bgcolor_danger");
		//window.mr.setReqPersons();
		wi.modal({show:true, keyboard:false, backdrop:'static'});
	});

	// CSVボタンクリック時
	wl.find(".csv").on("click.downloadCSV", function(){
		var sortcolname = wl.data("sortcolname") || "",
		    sortorder = wl.data("sortorder") || "",
		    searchtype = wl.data("searchtype") || "",
		    searchtext = wl.data("searchtext") || "",
		    searchdatestart = wl.data("searchdatestart") || "",
		    searchdateend = wl.data("searchdateend") || "",
		    action = $("#form_workinput").attr("action"),
		    popup;
		popup = window.open( action + "?method=getListCSV&searchtype=" + searchtype + "&searchtext=" + searchtext + "&searchdatestart=" + searchdatestart + "&searchdateend=" + searchdateend, "csv");
	});

	// 月次CSVボタンクリック時
	wl.find(".reportcsv").on("click.downloadCSV", function(){
		var sortcolname = wl.data("sortcolname") || "",
		    sortorder = wl.data("sortorder") || "",
		    searchtype = wl.data("searchtype") || "",
		    searchtext = wl.data("searchtext") || "",
		    searchdatestart = wl.data("searchdatestart") || "",
		    searchdateend = wl.data("searchdateend") || "",
		    action = $("#form_workinput").attr("action"),
		    popup;
		popup = window.open( action + "?method=getReportCSV&searchtype=" + searchtype + "&searchtext=" + searchtext + "&searchdatestart=" + searchdatestart + "&searchdateend=" + searchdateend, "reportcsv");
	});

	// 作業詳細modalのclose時、内容を削除
	wd.on( "hidden.bs.modal", function(){
		wd.find("dd").empty();
	});

	// 並べ替えリンク設定
	$.each( wl.find(".th-sort"), function( index, item ){

		$(item).on( "click", function( e ){
			var wl = $("#worklist"),
			    a = $(item),
			    sortcolname = a.data( "sortcolname" ),
			    sortorder = a.data( "sortorder" ),
			    sortarrow = "",
			    th_actived = $(".sort-active");
			
			e.preventDefault();

			// toggle order
			if( !sortorder ) {
				sortorder = "asc";
				sortarrow = "up";
			} else {
				if( sortorder == "asc" ) {
					sortorder = "desc";
					sortarrow = "down";
				} else {
					sortorder = "asc";
					sortarrow = "up";
				}
			}
			
			wl.data( "sortcolname", sortcolname );
			wl.data( "sortorder", sortorder );
			wl.find( ".refresh" ).trigger( "click.refresh" );

			if( th_actived ) {
				th_actived.attr( "class", "" );
				th_actived.addClass( "th-sort" );
				th_actived.find("span").detach();
			}

			a.data( "sortorder", sortorder );
			a.addClass( "sort-active" );
			a.addClass( "sort-" + sortorder );
			a.append( $("<span> </span>").addClass( "glyphicon glyphicon-chevron-" + sortarrow ) ); // sort arrow img
		});
	});

	// 検索欄クリック時
	wl.find(".searchtext").on( "click", function( e ){
		this.select();
	}).on( "keypress", function( e ){ // when enter key
		if( e.which == 13 ){
			wl.find(".btn-search").trigger("click");
			e.preventDefault();
			this.select();
		}			
	});

	// 検索ボタン押下時
	wl.find(".search").on( "click", ".btn-search", function( e ){
		var wl = $("#worklist");
		wl.data( "searchtext", wl.find(".searchtext").val() );
		wl.find( ".refresh" ).trigger( "click.refresh" );
	});

	// 検索項目押下時
	$.each( wl.find(".search-dropdown"), function( index, item ){
		var wl = $("#worklist"),
		    a = $(item);
		a.on("click", function(e){
			e.preventDefault();

			// set dropdown title
			wl.find(".search-dropdown-default").html( a.text() + "<span class='caret'></span>" );
			wl.find(".searchtext").attr("placeholder",a.data("placeholder")).focus();

			// set search type
			wl.data("searchtype", a.data("searchtype"));
		});
	});

	// resetボタン押下時
	wl.find(".search").on( "click", ".btn-reset", function( e ){
		var wl = $("#worklist");
		wl.data( "currentPageno", 1);
		wl.data( "searchtype", "detail" );
		wl.data( "searchtext", "" );
		wl.data( "searchdatestart", "" );
		wl.data( "searchdateend", "" );
		wl.find( ".search-dropdown-default" ).html( "内容<span class='caret'></span>" );
		wl.find( ".searchtext" ).attr( "placeholder", "" ).val("");
		wl.find( ".datepicker-list" ).val("");
		wl.find( ".refresh" ).trigger( "click.refresh" );
	});

	// 発生日start,end入力時
	wl.find(".datepicker-list").on( "change", function( e ){
		var val = $(this).val(),
		    name = $(this).attr("name");
		if( mr.isValidData( RE_DATE, val ) ){
			wl.data( name, val );
			wl.find( ".refresh" ).trigger( "click.refresh" );
		}
	});

	// 状況toggleボタン押下時
	wl.find(".btn-status").on( "click", function( e ){
		var statusList = wl.data("searchstatus"),
		    status = $(this).data("status");

		if( $(this).hasClass("active") ){
			
			console.log('ACTIVE BUTTON:', status);
			
			//$(statusList).each(function(index,item){
				//console.log(item);
				//if( item == status ) statusList
			//});
		}else{ // inactive
			console.log('INACTIVE BUTTON:', status);
		}
	});

	// 月次goggleボタン押下時
	wl.find(".btn-flag-report").on( "click", function( e ){
		console.log($(this).data("flag-report"));
	});

	// 行数select押下時
	wl.find(".select-rows").on( "change", function(e){
		wl.data( "rowsperpage", $(this).val() );
		wl.find( ".refresh" ).trigger( "click.refresh" );
	});

	// 作業時間
	$("#workTimeText").on( "keypress", function(e){
		var re_num = /^[0-9]$/;
		if ( mr.isValidData( re_num, e.key ) ) {
			console.log(e.key);
		} else {
			console.log("not valid");
		}
	});

	// 作業詳細：印刷ボタン
	wd.find(".print-detail").on( "click", function(e){
		window.print();
	});

	/***********************
		event : 電話対応
	***********************/
	cl.on( "click.refresh", ".refresh", window.mr.refreshCallList );

	cl.find(".call-send").on( "click.addCall", function(e){
		console.log("call-send");
		mr.addCall(e);
	});

	cl.find(".call-stop").on( "click.call-stop", function(e){
		var now = new Date();
		console.log("call-stop");
	});


	/***************
		初期表示
	***************/

	// init date picker
	mr.initDatepicker();

	// hide msgBox
	$("#div_errMsg").hide();

	// invoke work list trigger
	wl.find(".refresh").trigger("click.refresh"); // 作業一覧更新

	// display customer list
	// mr.getCustomerList();

	// invoke call list trigger
	cl.find(".refresh").trigger("click.refresh"); // 通話一覧更新

	// init selectCallTime
	mr.initSelectCallTime();

	$("#anchor_changelog").on("click",function(e){
		$("#changelog").modal({show:true, keyboard:false, backdrop:'static'});
	});

});