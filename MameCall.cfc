<cfcomponent output="false">

	<cfset variables.ds = "dev" />
	<cfset variables.cfjson = createObject( "component", "util.Cfjson" ) />
	<cfset variables.client_ip = cgi.remote_addr />
	<cfset variables.default_rowsPerPage = 10 />


	<cffunction access="public" name="init" returnType="MameCall">
		<cfreturn this />
	</cffunction>

	<!------------------------------------------------------------------------------------------------------------
		getList
	------------------------------------------------------------------------------------------------------------>
	<cffunction access="remote" name="getList" returnType="string" output="false" returnFormat="plain" hint="一覧取得">
		<cfset var local = {} />
		<cfsetting showDebugOutput = "false" />
		
		<!--- url param --->
		<cfparam type="numeric" name="url.rowsPerPage" default="#variables.default_rowsPerPage#" />
		<cfparam type="numeric" name="url.pageno" default="1" />

		<!--- get total rows --->
		<cfquery name="local.qGetTotalCount" datasource="#variables.ds#">
			select
				count(*) as cnt
			from
				tools.t_calllist
			where
				delete_date is null
		</cfquery>
		<cfset local.rowsTotal = local.qGetTotalCount.cnt />

		<!--- pagination --->
		<cfset local.rownoStart = ( url.pageno - 1 ) * url.rowsPerPage + 1 />
		<cfif local.rownoStart GT local.rowsTotal>
			<cfset local.rownoStart = 1 />
		</cfif>

		<!--- get call list --->
		<cfquery name="local.qGetCallList" datasource="#variables.ds#">
			set @rowno = 0,@rownoStart = #local.rownoStart#, @rowsPerPage = #url.rowsPerPage#, @rowno_disp = #local.rowsTotal + 1#;

			select
				*
			from
			(
				select
					@rowno := @rowno + 1 as rowno
					,@rowno_disp := @rowno_disp - 1 as rowno_disp
					,id
				    ,id_work
				    ,date_format( time_end, '%Y/%m/%d %H:%i:%s' ) as time_end
				    ,duration
				    ,person_call
				    ,person_take
				    ,comment
				    ,insert_date
				    ,update_date
				    ,delete_date
				from
					tools.t_calllist
				where
					delete_date is null
				order by
					id desc
			) calllist
			where
				rowno >= @rownoStart
			and	rowno < @rownoStart + @rowsPerPage;
		</cfquery>

		<!--- store return values --->
		<cfset local.returnValue = {} />
		<cfset local.returnValue.calllist = local.qGetCallList />
		<cfset local.returnValue.currentPageNo = url.pageno />
		<cfset local.returnValue.rowsTotal = local.rowsTotal />
		
		<cfreturn variables.cfjson.encode( local.returnValue ) />
	</cffunction>

	<!------------------------------------------------------------------------------------------------------------
		getYearMonth
	------------------------------------------------------------------------------------------------------------>
	<cffunction access="remote" name="getYearMonth" returnType="string" output="false" returnFormat="plain" hint="集計対象年月取得">
		<cfset var local = {} />
		<cfsetting showDebugOutput = "false" />

		<!--- get list --->
		<cfquery name="local.qGetYearMonth" datasource="#variables.ds#">
			select
				year(time_end) as year,
			    lpad(month(time_end),2,0) as month
			from
				tools.t_calllist
			where
				delete_date is null
			group by
				year(time_end),
			    month(time_end)
			order by
				year(time_end) desc,
			    month(time_end) desc
		</cfquery>

		<!--- store return values --->
		<cfset local.returnValue = {} />
		<cfset local.returnValue.ymlist = local.qGetYearMonth />
		
		<cfreturn variables.cfjson.encode( local.returnValue ) />
	</cffunction>

	<!------------------------------------------------------------------------------------------------------------
		getCallStatistics
	------------------------------------------------------------------------------------------------------------>
	<cffunction access="remote" name="getCallStatistics" returnType="string" output="false" returnFormat="plain" hint="一覧取得">
		<cfargument type="string" name="year" default="">
		<cfargument type="string" name="month" default="">

		<cfset var local = {} />
		<cfsetting showDebugOutput = "false" />

		<!--- get list --->
		<cfquery name="local.qGetCallStatistics" datasource="#variables.ds#">
			select
				person_call
			    ,person_take
			    ,count(duration) as cnt
			    ,sum(duration) as sod
			from
				tools.t_calllist
			where
				duration is not null
			and	delete_date is null
			<cfif arguments.year NEQ "">and	year(time_end) = '#arguments.year#'</cfif>
			<cfif arguments.month NEQ "">and	month(time_end) = '#arguments.month#'</cfif>
			group by
				person_call
			    ,person_take
			order by
				sod desc;
		</cfquery>

		<!--- store return values --->
		<cfset local.returnValue = {} />
		<cfset local.returnValue.callstatistics = local.qGetCallStatistics />
		
		<cfreturn variables.cfjson.encode( local.returnValue ) />
	</cffunction>

	<!------------------------------------------------------------------------------------------------------------
		addCall
	------------------------------------------------------------------------------------------------------------>
	<cffunction access="remote" name="addCall" returnType="string" output="false" returnFormat="plain" hint="登録">
		<cfargument type="string" name="formdata" />
		<cfargument type="string" name="timestamp" />

		<cfset var local = {} />
		<cfsetting showDebugOutput = "false" />

		<cfset local.form = deserializeJSON( arguments.formdata ) />
		<cfset local.timestamp = arguments.timestamp />

		<cflog file="MameCall" text="#arguments.formdata#">
		<cflog file="MameCall" text="#arguments.timestamp#">

		<!--- 
			local.timestamp
			local.form.call_sl_duration
			local.form.call_sl_person_call
			local.form.call_sl_person_take
			local.form.call_tx_comment
			local.form.call_sl_incident
		--->

		<cfif not structKeyExists( local.form, "call_sl_incident" ) or not isNumeric( local.form.call_sl_incident )>
			<cfset local.param_incident = "null">
		<cfelse>
			<cfset local.param_incident = local.form.call_sl_incident>
		</cfif>

		<!--- add list --->
		<cfquery name="local.qAddCall" datasource="#variables.ds#">
			insert into t_calllist
			(
				time_end
			    ,duration
			    ,person_call
			    ,person_take
			    ,comment
			    ,id_work
			    ,ip
			    ,insert_date
			)
			values
			(
				'#local.timestamp#'
				,#local.form.call_sl_duration#
				,'#local.form.call_sl_person_call#'
				,'#local.form.call_sl_person_take#'
				,'#local.form.call_tx_comment#'
				,#local.param_incident#
				,'#variables.client_ip#'
				,now()
			);

			select LAST_INSERT_ID() as id;
		</cfquery>

		<!--- store return values --->
		<cfset local.returnValue = {} />
		<cfset local.returnValue.id = local.qAddCall.id />
		<cfset local.returnValue.cookie = {} />
	
		<cfreturn variables.cfjson.encode( local.returnValue ) />
	</cffunction>

	<!------------------------------------------------------------------------------------------------------------
		updateCall
	------------------------------------------------------------------------------------------------------------>
	<cffunction access="remote" name="updateCall" returnType="string" output="false" returnFormat="plain" hint="更新">
		<cfargument type="string" name="formdata" />

		<cfset var local = {} />
		<cfsetting showDebugOutput = "false" />

		<cfset local.form = deserializeJSON( arguments.formdata ) />

		<!--- store return values --->
		<cfset local.returnValue = {} />
		
		<cfreturn variables.cfjson.encode( local.returnValue ) />
	</cffunction>

	<!------------------------------------------------------------------------------------------------------------
		removeCall
	------------------------------------------------------------------------------------------------------------>
	<cffunction access="remote" name="removeCall" returnType="string" output="false" returnFormat="plain" hint="削除">
		<cfargument type="string" name="removeId" />

		<cfset var local = {} />
		<cfsetting showDebugOutput = "false" />

		<cfquery name="local.qRemoveCall" datasource="#variables.ds#">
			update t_calllist
			set
				delete_date = now()
				,ip = '#variables.client_ip#'
			where
				id = #arguments.removeId#
		</cfquery>

		<!--- store return values --->
		<cfset local.returnValue = {} />
		
		<cfreturn variables.cfjson.encode( local.returnValue ) />
	</cffunction>

</cfcomponent>