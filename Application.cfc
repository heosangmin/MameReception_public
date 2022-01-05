<!---
   Application.cfc
--->
<cfcomponent>
   <cfset this.name="MameReception">
   <cfset this.sessionmanagement="yes">

   <cffunction name="onApplicationStart" returnType="boolean">
      <cfreturn true>
   </cffunction>

   <cffunction name="onRequestStart" returntype="boolean">
      <cfargument type="String" name="targetPage" required=true/>
      <cflog application="true" text="onRequestStart: #arguments.targetPage#">
      <cfreturn true>
   </cffunction>

   <cffunction name="onRequest" returntype="void">
      <cfargument name="targetPage" type="string" required=true/>

      <cfsetting showdebugoutput=true>

      <cftry>
         <cfinclude template="#arguments.targetPage#">
         <cfcatch type="any">
            <cfdump var="#cfcatch#">
         </cfcatch>
      </cftry>
   </cffunction>

</cfcomponent>