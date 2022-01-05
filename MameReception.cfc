<cfcomponent output="false">

	<cfset variables.ds = "dev" />
	<cfset variables.cfjson = createObject( "component", "util.Cfjson" ) />
	<cfset variables.client_ip = cgi.remote_addr />
	<cfset variables.default_rowsPerPage = 20 />


	<cffunction access="public" name="init" returnType="MameReception">
		<cfreturn this />
	</cffunction>

	<cffunction access="remote" name="getWork" returnType="string" output="false" returnFormat="plain" hint="作業取得">
		<cfset var local = {} />
		<cfsetting showDebugOutput="false" />

		<cfset local.returnValue = {} />

		<cfif structKeyExists( url, "id" ) AND isNumeric( url.id )>
			<cfset local.id = url.id />

			<cfquery name="local.qGetWork" datasource="#variables.ds#" >
				select
					id
					,date_format( date_start, '%Y/%m/%d' ) as date_start
					,date_format( date_demand, '%Y/%m/%d' ) as date_demand
					,date_format( date_end, '%Y/%m/%d' ) as date_end
					,branch
					,person_request
					,person_in_charge
					,person_write
					,type
					,origin_location
					,origin_system
					,title
					,detail
					,status
					,manage
					,comment
					,work_time
					,flag_report
					,final_check
					,case final_check
						when 0 then '未確認'
						when 1 then '確認済'
						when 9 then '不要'
						else '？'
					end as final_check_string
					,id_notes
					,ip
					,date_format( insert_date, '%Y/%m/%d %H:%i:%s' ) as insert_date
					,date_format( update_date, '%Y/%m/%d %H:%i:%s' ) as update_date
					,date_format( delete_date, '%Y/%m/%d %H:%i:%s' ) as delete_date
				from
					t_worklist worklist
				where
					id = #local.id#
			</cfquery>

			<cfif local.qGetWork.recordCount EQ 1>
				<cfset local.returnValue.data = {} />
				<cfset local.returnValue.data.work_id = local.qGetWork.id />
				<cfset local.returnValue.data.work_tx_date_start = local.qGetWork.date_start />
				<cfset local.returnValue.data.work_tx_date_demand = local.qGetWork.date_demand />
				<cfset local.returnValue.data.work_tx_date_end = local.qGetWork.date_end />
				<cfset local.returnValue.data.work_rb_branch = local.qGetWork.branch />
				<cfset local.returnValue.data.work_tx_person_request = local.qGetWork.person_request />
				<cfset local.returnValue.data.work_sl_person_in_charge = local.qGetWork.person_in_charge />
				<cfset local.returnValue.data.work_hn_person_writen = local.qGetWork.person_write />
				<cfset local.returnValue.data.work_sl_type = local.qGetWork.type />
				<cfset local.returnValue.data.work_sl_origin_location = local.qGetWork.origin_location />
				<cfset local.returnValue.data.work_sl_origin_system = local.qGetWork.origin_system />
				<cfset local.returnValue.data.work_tx_title = local.qGetWork.title />
				<cfset local.returnValue.data.work_ta_detail = local.qGetWork.detail />
				<cfset local.returnValue.data.work_ta_manage = local.qGetWork.manage />
				<cfset local.returnValue.data.work_ta_comment = local.qGetWork.comment />
				<cfset local.returnValue.data.work_tx_work_time = local.qGetWork.work_time />
				<cfset local.returnValue.data.work_rb_status = local.qGetWork.status />
				<cfset local.returnValue.data.work_rb_flag_report = local.qGetWork.flag_report />
				<cfset local.returnValue.data.work_rb_final_check = local.qGetWork.final_check />
				<cfset local.returnValue.data.work_rb_final_check_string = local.qGetWork.final_check_string />
				<cfset local.returnValue.data.work_id_notes = local.qGetWork.id_notes />
				<cfset local.returnValue.data.work_hn_ip = local.qGetWork.ip />
				<cfset local.returnValue.data.work_hn_insert_date = local.qGetWork.insert_date />
				<cfset local.returnValue.data.work_hn_update_date = local.qGetWork.update_date />
				<cfset local.returnValue.data.work_hn_delete_date = local.qGetWork.delete_date />
			</cfif>

		</cfif>

		<cfreturn variables.cfjson.encode( local.returnValue ) />
	</cffunction>

	<cffunction access="remote" name="getList" returnType="string" output="false" returnFormat="plain" hint="作業一覧取得">
		<cfset var local = {} />
		<cfsetting showDebugOutput = "false" />

		<cfparam type="numeric" name="url.rowsPerPage" default="#variables.default_rowsPerPage#" />
		<cfparam type="numeric" name="url.pageno" default="1" />
		<cfparam type="string" name="url.sortcolname" default="" />
		<cfparam type="string" name="url.sortorder" default="" />
		<cfparam type="string" name="url.searchtype" default="" />
		<cfparam type="string" name="url.searchtext" default="" />
		<cfparam type="string" name="url.searchdatestart" default="" />
		<cfparam type="string" name="url.searchdateend" default="" />
		<cfparam type="string" name="url.searchstatus" default="発生,中間,済" />
		<cfparam type="string" name="url.searchflagreport" default="1,0" />

		<cfset searchstatus_converted = "">
		<cfif url.searchstatus NEQ "">
			<cfloop list="#url.searchstatus#" index="item">
				<cfset searchstatus_converted = listappend(searchstatus_converted, chr(39) & item & chr(39))>
			</cfloop>
		</cfif>

		<!--- get total rows --->
		<cfquery name="local.qGetTotalCount" datasource="#variables.ds#">
			select
				count(*) as cnt
			from
				t_worklist
			where
				delete_date is null
			<cfif searchstatus_converted NEQ "">and	status in (#preserveSingleQuotes(searchstatus_converted)#) </cfif>
			<cfif url.searchtype NEQ "" AND url.searchtext NEQ "">and	#url.searchtype# like '%#url.searchtext#%'</cfif>
			<cfif url.searchdatestart NEQ "">and	date_start >= '#url.searchdatestart#'</cfif>
			<cfif url.searchdateend NEQ "">and	date_start <= '#url.searchdateend#'</cfif>
		</cfquery>
		<cfset local.rowsTotal = local.qGetTotalCount.cnt />

		<!--- pagination --->
		<cfset local.rownoStart = ( url.pageno - 1 ) * url.rowsPerPage + 1 />
		<cfif local.rownoStart GT local.rowsTotal>
			<cfset local.rownoStart = 1 />
		</cfif>

		<!--- get work list --->
		<cfquery name="local.qGetWorkList" datasource="#variables.ds#">
			set @rowno = 0,@rownoStart = #local.rownoStart#, @rowsPerPage = #url.rowsPerPage#, @rowno_disp = #local.rowsTotal + 1#;
			select
				rowno
				,rowno_disp
				,id
				,date_format( date_start, '%Y/%m/%d' ) as date_start
				,date_format( date_demand, '%Y/%m/%d' ) as date_demand
				,date_format( date_end, '%Y/%m/%d' ) as date_end
				,branch
				,person_request
				,type
				,title
				,detail
				,status
				,manage
				,person_in_charge
				,person_write
				,case flag_report
					when 0 then '☓'
					else '○'
				end as flag_report
				,case final_check
					when 0 then '未確認'
					when 1 then '確認済'
					when 9 then '不要'
					else '？'
				end as final_check
				,ip
				,date_format( insert_date, '%Y/%m/%d %H:%i:%s' ) as insert_date
				,date_format( update_date, '%Y/%m/%d %H:%i:%s' ) as update_date
				,date_format( delete_date, '%Y/%m/%d %H:%i:%s' ) as delete_date
			from
			(
				select
					@rowno := @rowno + 1 as rowno
					,@rowno_disp := @rowno_disp - 1 as rowno_disp
					,id
					,date_start
					,date_demand
					,date_end
					,branch
					,person_request
					,type
					,title
					,left(detail,50) as detail
					,status
					,manage
					,person_in_charge
					,person_write
					,flag_report
					,final_check
					,ip
					,insert_date
					,update_date
					,delete_date
				from
					t_worklist worklist
				where
					delete_date is null
				<cfif searchstatus_converted NEQ "">and	status in ( #preserveSingleQuotes(searchstatus_converted)# ) </cfif>
				<cfif url.searchtype NEQ "" AND url.searchtext NEQ "">and	#url.searchtype# like '%#url.searchtext#%'</cfif>
				<cfif url.searchdatestart NEQ "">and	date_start >= '#url.searchdatestart#'</cfif>
				<cfif url.searchdateend NEQ "">and	date_start <= '#url.searchdateend#'</cfif>
				<cfif url.sortcolname NEQ "" and url.sortorder NEQ "">order by #url.sortcolname# #url.sortorder#<cfif url.sortcolname NEQ "id">
					, id desc</cfif></cfif>
			) worklist
			where	rowno >= @rownoStart and rowno < @rownoStart + @rowsPerPage;
		</cfquery>

		<!--- store return values --->
		<cfset local.returnValue = {} />
		<cfset local.returnValue.worklist = local.qGetWorkList />
		<cfset local.returnValue.currentPageNo = url.pageno />
		<cfset local.returnValue.rowsTotal = local.rowsTotal />
		
		<cfreturn variables.cfjson.encode( local.returnValue ) />
	</cffunction>

	<cffunction access="remote" name="getSummaryList" returnType="string" output="false" returnFormat="plain" hint="作業の簡略一覧取得">
		<cfset var local = {} />
		<cfsetting showDebugOutput = "false" />

		<!--- <cflog file="MameReception" text="getSummaryList"> --->

		<!--- get work list --->
		<cfquery name="local.qGetWorkListSummary" datasource="#variables.ds#">
			select
				id
                ,person_request
                ,person_in_charge
                ,title
			from
				tools.t_worklist
			where
				delete_date is null
			order by
				id desc
			limit 100
		</cfquery>

		<!--- store return values --->
		<cfset local.returnValue = {} />
		<cfset local.returnValue.worklist = local.qGetWorkListSummary />
				
		<cfreturn variables.cfjson.encode( local.returnValue ) />
	</cffunction>

	<cffunction access="remote" name="addWork" returnType="string" returnFormat="plain" output="false" hint="作業登録">
		<cfargument type="string" name="formdata" />
		<cfset var local = {} />
		<cfsetting showDebugOutput="false" />

		<!--- 
			formのデータ

			work_tx_date_start       : 発生日時(yyyy/mm/dd)
			work_tx_date_demand      : 納期(yyyy/mm/dd)
			work_tx_date_end         : 回復日時(yyyy/mm/dd)
			work_rb_branch           : 拠点(支店Z、支店A、支店B、支店D、支店K、その他文字列)
			work_tx_person_request   : 発信元(文字列)
			work_sl_person_in_charge : 担当者(文字列)
			work_sl_type             : 分類(文字列)
			work_sl_origin_location  : 原因所在(char 1)
			work_sl_origin_system    : 対象分類(char 1)
			work_tx_title            : タイトル(文字列)
			work_ta_detail           : 内容(文字列)
			work_ta_manage           : 対処(文字列)
			work_ta_comment          : コメント(文字列)
			work_tx_work_time        : 作業時間(数字)
			work_rb_status           : 状況(文字列)
			work_rb_flag_report      : 月次報告対象(true,false)
		--->
		<cfset local.form = deserializeJSON( arguments.formdata ) />

		<!--- escape backslash --->
		<cfset local.form["work_tx_title"] = replace(local.form["work_tx_title"],"\","\\","all")>
		<cfset local.form["work_ta_detail"] = replace(local.form["work_ta_detail"],"\","\\","all")>
		<cfset local.form["work_ta_manage"] = replace(local.form["work_ta_manage"],"\","\\","all")>
		<cfset local.form["work_ta_comment"] = replace(local.form["work_ta_comment"],"\","\\","all")>

		<!--- translate single quote --->
		<cfset local.form["work_tx_title"] = replace(local.form["work_tx_title"],chr(39),"","all")>
		<cfset local.form["work_ta_detail"] = replace(local.form["work_ta_detail"],chr(39),"","all")>
		<cfset local.form["work_ta_manage"] = replace(local.form["work_ta_manage"],chr(39),"","all")>
		<cfset local.form["work_ta_comment"] = replace(local.form["work_ta_comment"],chr(39),"","all")>
	
		
		<!--- 
			insert to DB
		--->
		<cfquery name="local.qInsertWork" datasource="#variables.ds#">
			insert into	t_worklist
			(
				date_start
				,date_demand
				,date_end
				,branch
				,person_request
				,person_in_charge
				,person_write
				,type
				,origin_location
				,origin_system
				,title
				,detail
				,manage
				,comment
				,work_time
				,status
				,flag_report
				,final_check
				,ip
				,insert_date
			)
			values
			(
				convert( '#local.form.work_tx_date_start#', datetime )
				,<cfif local.form.work_tx_date_demand NEQ "">convert( '#local.form.work_tx_date_demand#', datetime )<cfelse>null</cfif>
				,<cfif local.form.work_tx_date_end NEQ "">convert( '#local.form.work_tx_date_end#', datetime )<cfelse>null</cfif>
				,'#local.form.work_rb_branch#'
				,'#local.form.work_tx_person_request#'
				,'#local.form.work_sl_person_in_charge#'
				,'記入者'
				,'#local.form.work_sl_type#'
				,'#local.form.work_sl_origin_location#'
				,'#local.form.work_sl_origin_system#'
				,'#local.form.work_tx_title#'
				,'#local.form.work_ta_detail#'
				,'#local.form.work_ta_manage#'
				,'#local.form.work_ta_comment#'
				,<cfif local.form.work_tx_work_time EQ "">0<cfelse>#local.form.work_tx_work_time#</cfif>
				,'#local.form.work_rb_status#'
				,#local.form.work_rb_flag_report#
				,#local.form.work_rb_final_check#
				,'#variables.client_ip#'
				,now()
			)

		</cfquery>
		<cfset local.returnValue = {} />
		<cfset local.returnValue.formdata = local.form />
		<cfreturn variables.cfjson.encode( local.returnValue ) />
	</cffunction>

	<cffunction access="remote" name="removeWork" returnType="string" returnFormat="plain" output="false" hint="作業削除">
		<cfargument type="string" name="removeId" />
		<cfset var local = {} />
		<cfsetting showDebugOutput="false" />

		<cfquery name="local.qRemoveWork" datasource="#variables.ds#">
			update t_worklist
			set
				delete_date = now()
				,ip = '#variables.client_ip#'
			where
				id = #arguments.removeId#
		</cfquery>

		<cfset local.returnValue = {} />

		<cfreturn variables.cfjson.encode( local.returnValue ) />
	</cffunction>

	<cffunction access="remote" name="updateWork" returnType="string" returnFormat="plain" output="false" hint="作業修正">
		<cfset var local = {} />
		<cfsetting showDebugOutput="false" />
		<!--- 
			formのデータ

			work_tx_date_start       : 発生日時(yyyy/mm/dd)
			work_tx_date_demand      : 納期(yyyy/mm/dd)
			work_tx_date_end         : 回復日時(yyyy/mm/dd)
			work_rb_branch           : 拠点(支店Z、支店A、支店B、支店D、支店K、その他文字列)
			work_tx_person_request       : 発信元(文字列)
			work_sl_person_in_charge : 担当者(文字列)
			work_sl_type             : 分類(文字列)
			work_sl_origin_location  : 原因所在(char 1)
			work_sl_origin_system    : 対象分類(char 1)
			work_tx_title            : タイトル(文字列)
			work_ta_detail           : 内容(文字列)
			work_ta_manage           : 対処(文字列)
			work_ta_comment          : コメント(文字列)
			work_tx_work_time        : 作業時間(数字)
			work_rb_status           : 状況(文字列)
			work_rb_flag_report      : 月次報告対象(true,false)
			work_hn_id               : id
		--->
		<cfset local.form = deserializeJSON( arguments.formdata ) />

		<!--- escape backslash --->
		<cfset local.form["work_tx_title"] = replace(local.form["work_tx_title"],"\","\\","all")>
		<cfset local.form["work_ta_detail"] = replace(local.form["work_ta_detail"],"\","\\","all")>
		<cfset local.form["work_ta_manage"] = replace(local.form["work_ta_manage"],"\","\\","all")>
		<cfset local.form["work_ta_comment"] = replace(local.form["work_ta_comment"],"\","\\","all")>

		<!--- translate single quote --->
		<cfset local.form["work_tx_title"] = replace(local.form["work_tx_title"],chr(39),"","all")>
		<cfset local.form["work_ta_detail"] = replace(local.form["work_ta_detail"],chr(39),"","all")>
		<cfset local.form["work_ta_manage"] = replace(local.form["work_ta_manage"],chr(39),"","all")>
		<cfset local.form["work_ta_comment"] = replace(local.form["work_ta_comment"],chr(39),"","all")>

		<!--- 
			update DB
		--->
		<cfquery name="local.qUpdateWork" datasource="#variables.ds#">
			update 
				t_worklist
			set
				date_start = convert( '#local.form.work_tx_date_start#', datetime )
				,date_demand = <cfif local.form.work_tx_date_demand NEQ "">convert( '#local.form.work_tx_date_demand#', datetime )<cfelse>null</cfif>
				,date_end = <cfif local.form.work_tx_date_end NEQ "">convert( '#local.form.work_tx_date_end#', datetime )<cfelse>null</cfif>
				,branch = '#local.form.work_rb_branch#'
				,person_request = '#local.form.work_tx_person_request#'
				,person_in_charge = '#local.form.work_sl_person_in_charge#'
				,person_write = '記入者'
				,type = '#local.form.work_sl_type#'
				,origin_location = <cfif structKeyExists(local.form, "work_sl_origin_location") AND local.form.work_sl_origin_location NEQ "">'#local.form.work_sl_origin_location#'<cfelse>null</cfif>
				,origin_system = <cfif structKeyExists(local.form, "work_sl_origin_system") AND local.form.work_sl_origin_system NEQ "">'#local.form.work_sl_origin_system#'<cfelse>null</cfif>
				,title = '#local.form.work_tx_title#'
				,detail = '#local.form.work_ta_detail#'
				,manage = '#local.form.work_ta_manage#'
				,comment = '#local.form.work_ta_comment#'
				,work_time = <cfif local.form.work_tx_work_time EQ "">0<cfelse>#local.form.work_tx_work_time#</cfif>
				,status = '#local.form.work_rb_status#'
				,flag_report = #local.form.work_rb_flag_report#
				,final_check = #local.form.work_rb_final_check#
				,ip = '#variables.client_ip#'
				,update_date = now()
			where
				id = #local.form.work_hn_id#
		</cfquery>
		<cfset local.returnValue = {} />
		<cfset local.returnValue.formdata = local.form />
		<cfreturn variables.cfjson.encode( local.returnValue ) />
	</cffunction>

	<cffunction access="remote" name="getReqPersons" returnType="string" returnFormat="plain" output="false" hint="発信元のリストを取得">
		<cfset var local = {} />
		<cfsetting showDebugOutput="false" />

		<cfquery name="qGetReqPersons" datasource="#variables.ds#">
			select
				person_request
			from
				t_worklist
			where
				delete_date is null
			and	person_request <> ''
			group by
				person_request
			order by
				person_request
		</cfquery>

		<cfset local.returnValue = {} />
		<cfset local.returnValue.reqPersons = listToArray( valueList( qGetReqPersons.person_request ) ) />

		<cfreturn variables.cfjson.encode( local.returnValue ) />
	</cffunction>

	<cffunction access="remote" name="getListCSV" returnType="void" output="true" hint="作業一覧をCSV形式で取得">
		<cfset var local = {} />
		<cfsetting showDebugOutput = "false" />
		<cfsetting enableCFoutputOnly = "true" />

		<cfparam type="string" name="url.searchtype" default="" />
		<cfparam type="string" name="url.searchtext" default="" />
		<cfparam type="string" name="url.searchdatestart" default="" />
		<cfparam type="string" name="url.searchdateend" default="" />
		<cfparam type="string" name="url.searchstatus" default="発生,中間,済" />
		<cfparam type="string" name="url.searchreportflag" default="1,0" />

		<cfquery name="local.qGetWorkList" datasource="#variables.ds#">
			set @rowno = 0;

			select
				rowno
				,id
				,date_format( date_start, '%Y/%m/%d' ) as date_start
				,date_format( date_demand, '%Y/%m/%d' ) as date_demand
				,date_format( date_end, '%Y/%m/%d' ) as date_end
				,branch
				,person_request
				,person_in_charge
				,type
				,origin_location
				,origin_system
				,title
				,detail
				,status
				,manage
				,case flag_report
					when 0 then '☓'
					else '○'
				end as flag_report
				,work_time
				,ip
				,date_format( insert_date, '%Y/%m/%d %H:%i:%s' ) as insert_date
				,date_format( update_date, '%Y/%m/%d %H:%i:%s' ) as update_date
				,date_format( delete_date, '%Y/%m/%d %H:%i:%s' ) as delete_date
			from
			(
				select
					@rowno := @rowno + 1 as rowno
					,id
					,date_start
					,date_demand
					,date_end
					,branch
					,person_request
					,type
					,origin_location
					,origin_system
					,title
					,detail
					,status
					,manage
					,person_in_charge
					,person_write
					,flag_report
					,work_time
					,ip
					,insert_date
					,update_date
					,delete_date
				from
					t_worklist worklist
				where
					delete_date is null
				and	status in ( #listQualify( url.searchStatus, chr(39) )# )
				and	flag_report in ( #url.searchreportflag# )
				<cfif url.searchtype NEQ "" AND url.searchtext NEQ "">and	#url.searchtype# like '%#url.searchtext#%'</cfif>
				<cfif url.searchdatestart NEQ "">and	date_start >= '#url.searchdatestart#'</cfif>
				<cfif url.searchdateend NEQ "">and	date_start <= '#url.searchdateend#'</cfif>
				order by id desc
			) worklist
		</cfquery>

		<cfset local.csvdata = queryToCsvText( local.qGetWorkList ) />
		<cfset local.today = dateFormat( now(), "YYYYMMDD" ) />

		<cfheader name="Content-disposition" value="attachment;filename=MemeReception_作業一覧_#local.today#.csv" />
		<cfcontent type="text/plain; charset=windows-31j" />
		<cfoutput>#local.csvdata#</cfoutput>
	</cffunction>


	<cffunction access="remote" name="getReportCSV" returnType="void" output="true" hint="作業一覧を月次CSV形式で取得">
		<cfset var local = {} />
		<cfsetting showDebugOutput = "false" />
		<cfsetting enableCFoutputOnly = "true" />

		<cfparam type="string" name="url.searchtype" default="" />
		<cfparam type="string" name="url.searchtext" default="" />
		<cfparam type="string" name="url.searchdatestart" default="" />
		<cfparam type="string" name="url.searchdateend" default="" />
		<cfparam type="string" name="url.searchstatus" default="発生,中間,済" />
		<cfparam type="string" name="url.searchreportflag" default="1,0" />

		<cfquery name="local.qGetWorkList" datasource="#variables.ds#">
			select
				id
				,branch as '拠点'
				,date_format( date_start, '%Y/%m/%d' ) as '受付日時'
				,date_format( date_end, '%Y/%m/%d' ) as '終了日時'
			    ,concat(
					case branch
						when '支店N' then '支店Z'
			    		else branch
			    	end
					,char(10),person_request,'様') as '氏名'
				,concat('【', title, '】', char(10), char(10), detail) as '内容'
				,case type
					when '不具合' then '動作異常'
					when 'データメンテ' then 'その他'
					when '調査' then '質問・操作'
					when '依頼修正' then 'その他'
					when '情報収集' then 'その他'
					else type
				end as '照会分類'
				,origin_location as '原因所在'
				,origin_system as '対象分類'
				,manage as '対処'
				,'' as 'オンライン影響'
				,'' as '関連ドキュメント'
				,case status
					when '済' then '最終'
					else status
				end as '進捗状況'
			from
			(
				select
					id
					,date_start
					,date_end
					,branch
					,person_request
					,type
					,origin_location
					,origin_system
					,title
					,detail
					,status
					,manage
				from
					t_worklist worklist
				where
					delete_date is null
				and	status in ( #listQualify( url.searchStatus, chr(39) )# )
				and	flag_report = 1
				<cfif url.searchtype NEQ "" AND url.searchtext NEQ "">and	#url.searchtype# like '%#url.searchtext#%'</cfif>
				<cfif url.searchdatestart NEQ "">and	date_start >= '#url.searchdatestart#'</cfif>
				<cfif url.searchdateend NEQ "">and	date_start <= '#url.searchdateend#'</cfif>
				order by id desc
			) worklist
		</cfquery>

		<cfset local.csvdata = queryToCsvText( local.qGetWorkList ) />
		<cfset local.today = dateFormat( now(), "YYYYMMDD" ) />

		<cfheader name="Content-disposition" value="attachment;filename=月次報告書_#local.today#.csv" />
		<cfcontent type="text/plain; charset=windows-31j" />
		<cfoutput>#local.csvdata#</cfoutput>
	</cffunction>


	<cffunction access="remote" name="getCustomerList" returnType="string" output="false" returnFormat="plain" hint="顧客一覧取得">
		<cfset var local = {} />
		<cfsetting showDebugOutput = "false" />

		<cfquery name="local.qGetCustomerList" datasource="#variables.ds#">
				SELECT
					mr_customer.customer_id,
				    mr_customer.company,
				    concat( mr_customer.first_name, '　', mr_customer.last_name ) as customer_name,
				    concat( ifnull(mr_customer.first_name_yomi,''), '　', ifnull(mr_customer.last_name_yomi,'') ) as customer_name_yomi,
				    mr_customer.branch,
				    mr_customer.department,
				    mr_customer.position,
				    mr_customer.mail_address,
				    mr_customer.tel,
				    mr_customer.description,
				    mr_customer.insert_date,
				    mr_customer.update_date,
				    mr_customer.delete_date
				FROM
					tools.mr_customer
				ORDER BY
					mr_customer.first_name_yomi;
		</cfquery>

		<!--- store return values --->
		<cfset local.returnValue = {} />
		<cfset local.returnValue.customerlist = local.qGetCustomerList />
		
		<cfreturn variables.cfjson.encode( local.returnValue ) />
	</cffunction>

	<!--- 
		HELPER
	--->
	<cffunction access="private" name="queryToCsvText" returnType="string" output="false" hint="クエリ結果をCSV形式の文字列に変換し返却する。">
		<cfargument name="query" type="query" required="true" />
		<cfargument name="includeColHeader" type="boolean" default="true" />

		<cfset var local = {} />
		<cfset local.retStr = "" />
		<cfset local.CRLF = chr(13) & chr(10) />
		<cfset local.LF = chr(10) />
		<cfset local.COMMA = chr(44) />

		<cfset local.colList = arrayToList( arguments.query.getColumnNames() ) />

		<cfif arguments.includeColHeader >
			<cfset local.retStr &=  local.colList & local.CRLF />
		</cfif>

		<cfloop query="arguments.query">
			<cfset local.tempLine = "" />
			<cfloop list="#local.colList#" index="colName">
				<cfset local.tempCol = evaluate( colName ) />
				<cfif find( local.CRLF, local.tempCol ) GT 0 OR
				      find( local.LF, local.tempCol ) GT 0 OR
				      find( local.COMMA, local.tempCol ) GT 0>
					<cfset local.tempCol = rereplace( local.tempCol, "(\r\n)+$", "" ) />
					<cfset local.tempCol = chr(34) & local.tempCol & chr(34) />
				</cfif>
				<cfset local.tempLine = listAppend( local.tempLine, replace( local.tempCol, chr(13), "", "all" ) ) />
			</cfloop>
			<cfset local.retStr &=  local.tempLine & local.CRLF />
		</cfloop>

		<cfreturn local.retStr />
	</cffunction>

</cfcomponent>