Only for educational purposes.

This server is based on evaluation of Incapsula JS code in "virtual dom" polyfill.

Step1. GET https://website.com/
Headers:
	user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36
Logic: Parse link to js code of incapsula
Parse:	from 	_analytics_scr.src = '/_Incapsula_Resource
			to 		'
			OR
			from 	src="/_Incapsula_Resource
			to		"
No link to js code - captcha/block



Step2.  GET to resource with code
Example link:  https://website.com/_Incapsula_Resource?SWJIYLWA=719d34d31c8e3a6e6fffd425f7e032f3
Headers: 
	user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36
	Referer: https://website.com/
	Accept: */*
	Accept-Encoding: gzip, deflate, br
	
Logic: Parse the whole body of response, example:
		(function() { var z="";var b="766....6c2";eval((function(){for (var i=0;i<b.length;i+=2){z+=String.fromCharCode(parseInt(b.substring(i,i+2),16));} return z;})());})();)
		
		
Step3. POST to the server
Example link: http://localhost:8888/generate
Postdata: (Parsed jscode of incapsula ;;;;;;(Delimitter)All cookies of the current website) encoded in base64
Example postdata, not in b64: 
	(function() { var z="";var b="766....6c2";eval((function(){for (var i=0;i<b.length;i+=2){z+=String.fromCharCode(parseInt(b.substring(i,i+2),16));} return z;})());})(););;;;;;visid_incap_1081500=nrJQPuKmS42sk92ztEMbJWR/O1wAAAAAQUIPAAAAAACSMifOxTGJLk9TH7PqxL9T; incap_ses_247_1081500=lqqUGjtmBlE+aXrXw4VtA2R/O1wAAAAAUYqJJfpeCsHvmm3uLyu5cg==; ___utmvmzVuDFLBB=bqlSyeECjcd; ___utmvazVuDFLBB=BtEUKOd; ___utmvbzVuDFLBB=fZM XUrObalz: Ltp
	Logic: If response contains set-cookie: ___utmvc= in headers then OK else Captcha/block
	parse json properties - imgsrc, useragent
	then need use new useragent in next request
	

Step3. GET to imgsrc, smth like verifying
example https://website.com/_Incapsula_Resource?SWKMTFSR=1&e=0.6509812405676245
where e=... is imgsrc of prev step
Headers:
	User-Agent: {prev request useragent}
	Accept: image/webp,image/apng,image/*,*/*;q=0.8
	Accept-Encoding: gzip, deflate, br
	Referer: https://website.com/
1 is ok

Step4. Verifying of access to the website, depending on response of request
GET to https://website.com/
Headers:
	User-Agent:  {same as prev}
	Accept-Encoding: gzip, deflate, br
	Referer: https://website.com/
Parse1:		from 	_analytics_scr.src = '/_Incapsula_Resource
			to 		'
			
Parse2:		from 	src="/_Incapsula_Resource
			to		"
if parse2 is not empty and parse1 is empty then parse1 := parse2

Logic: Parse link to js code of incapsula then 3 cases

//Blocked by Incapsula: detect iframe
if "incident_id=" is a part of Parse1 then Captcha/block ; iframeBlock

//no bypass cookie
If "___utmvc=a" is not presented in Headers of response and ___utmvc=a is not a part of all Cookies then Captcha/block ; noCookieBlock

//No access to site
If "Some text of HTML that is visible when request isn't blocked" is not presented in response body then Captcha/block ; noAccessBlock

other cases are OK
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
Overall logic:
incapsula detected -> trying to bypass 1,2,3 or more times, until access to website will be gained 
OR 1 attempt then Restart;

small hint:
bypass will work if incap_ses_ cookie is present
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;