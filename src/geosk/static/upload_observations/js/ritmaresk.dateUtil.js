/**
 *	ritmaresk.dateUtils.js
 *
 *  author: Paolo Tagliolato - CNR IREA in Milano - www.irea.cnr.it
 * 			paolo.tagliolato@gmail.com
 *
 *  version: 1.1 beta
 *
 *  
 *
 */

var ritmaresk=ritmaresk || {};

ritmaresk.DateUtil=( function () {

    /**
     *
     * @constructor
     */
	var DateUtil=function(){
		var self=this;
		// strings for construct RE
		var DD="([0-3]?\\d)",
			MM="([01]?\\d)",
			YY_YY="(\\d{2,4})",
			YYYY="(\\d{4})",
			HH="([0-2]?\\d)",
			mm="([0-5]?\\d)",
			ss="([0-5]?\\d)",
			ss_opt="(?:[\\.:]([0-5]?\\d))?",
			ss_ssss="([0-5]?\\d(\\.\\d{1,4})?)",
			_space_="\\s",
			_start_="^",
			_end_="$",
			_or_="|";

		self.formats={
			"I feel lucky":{
				shortName:"guess"
			},
			"DD/MM/YY[YY] HH.mm[.ss]":{
				regexp:new RegExp(_start_+[DD,MM,YY_YY].join("\\/")+_space_+[HH,mm].join("\\.")+ss_opt+_end_),
				permYMDHms:[3,2,1,4,5,6],// the array returns the positions of YYYY, MM, DD, HH, mm, ss within the regexp
				shortName:"ITA-1 (excel)"
			},
			"DD/MM/YY[YY] HH:mm[:ss]":{
				regexp:new RegExp(_start_+[DD,MM,YY_YY].join("\\/")+_space_+[HH,mm].join(":")+ss_opt+_end_),
				permYMDHms:[3,2,1,4,5,6],// l'array restituisce la posizione risp. di YYYY, MM, DD, HH, mm, ss nella regexp
				shortName:"ITA-2 (excel)"
			},
			"DD/MM/YY[YY] HH:mm:ss":{
				regexp:new RegExp(_start_+[DD,MM,YY_YY].join("\\/")+_space_+[HH,mm,ss].join(":")+_end_),
				permYMDHms:[3,2,1,4,5,6],// the array returns the positions of YYYY, MM, DD, HH, mm, ss within the regexp
				shortName:"ITA-3 (excel)"
			},
			"DD/MM/YY[YY] HH:mm":{
				regexp:new RegExp(_start_+[DD,MM,YY_YY].join("\\/")+_space_+[HH,mm].join(":")+_end_),
				permYMDHms:[3,2,1,4,5,6],// the array returns the positions of YYYY, MM, DD, HH, mm, ss within the regexp
				shortName:"ITA-4 (excel)"
			},
			"DD/MM/YY[YY] HH*mm[*ss]":{
				regexp:new RegExp(_start_+[DD,MM,YY_YY].join("\\/")+_space_+[HH,mm].join("[\\.:]")+ss_opt+_end_),
				permYMDHms:[3,2,1,4,5,6],// the array returns the positions of YYYY, MM, DD, HH, mm, ss within the regexp
				shortName:"ITA-3 (all)"
			},
			"DD/MM/YYYY HH*mm[*ss]":{
				regexp:new RegExp(_start_+[DD,MM,YYYY].join("\\/")+_space_+[HH,mm].join("[\\.:]")+ss_opt+_end_),
				permYMDHms:[3,2,1,4,5,6],// the array returns the positions of YYYY, MM, DD, HH, mm, ss within the regexp
				shortName:"ITA-3 (all)"
			},
			"MM/DD/YY[YY] HH:mm[:ss]":{
				regexp:new RegExp(_start_+[MM,DD,YY_YY].join("\\/")+_space_+[HH,mm].join(":")+ss_opt+_end_),
				permYMDHms:[2,3,1,4,5,6],// the array returns the positions of YYYY, MM, DD, HH, mm, ss within the regexp
				shortName:"USA (excel)"
			},
            "DD/MM/YY[YY]":{
                regexp:new RegExp(_start_+[DD,MM,YY_YY].join("\\/")+_end_),
                permYMDHms:[3,2,1,4,5,6],// the array returns the positions of YYYY, MM, DD, HH, mm, ss within the regexp
                shortName:"ITA-3 (no HH:MM:ss)"
            },
			"ISO":{
				regexp:/^(\d{4})-([01]\d)-([0-3]\d)T([0-2]\d):([0-5]\d):([0-5]\d)$/,
				permYMDHms:[1,2,3,4,5,6],
				shortName:"ISO 8601"
			}
		};
		
		self.isIso=function(sdate){
			var match=self.formats.ISO.regexp.exec(sdate);
			var res=false;
			if(match){res=true;}
			return(res);
		};

		/** returns an array with the matched formats (objects)
		 *
		 */
		self.matchedFormats=function(sdate) {
			var matchedFormats=[];
			for(var f in self.formats){
				if(f.regexp && f.regexp.exec(sdate)){
					matchedFormats.push(f);
				}
			}
		};

		self.convertToDate=function(sdate,formatName){
			var output=null;
			if(self.formats[formatName] && self.formats[formatName].regexp){
				var f=self.formats[formatName];
				console.warn(f.regexp);
				var match = f.regexp.exec(sdate);
				var Y=self.formats[formatName].permYMDHms[0],
					M=self.formats[formatName].permYMDHms[1],
					D=self.formats[formatName].permYMDHms[2],
					H=self.formats[formatName].permYMDHms[3],
					m=self.formats[formatName].permYMDHms[4],
					s=self.formats[formatName].permYMDHms[5];

				if(match){		
					// force conversion of 2 digits years into 21th century year
					if((match[Y].length===2)){
						match[Y]="20"+match[Y];
					}	
					var 
						year=Number(match[Y]),
						day= Number(match[D]),
					    month= Number(match[M])-1,
					    hour=Number(match[H]),
					    minutes=match[m]?Number(match[m]):0,
					    seconds=match[s]?Number(match[s]):0;

					output=new Date(year,month,day,hour,minutes,seconds);
					
				}
			}
			else{
				//try to create Date object from string
				output=new Date(sdate);
			}
			return output;
		};

		self.convertDateToISO_noTZ=function(d){
			var pad=function (number) {
		      if ( number < 10 ) {
		        return '0' + number;
		      }
		      return number;
		    };
		    
		    return d.getFullYear() +
		        '-' + pad( d.getMonth() + 1 ) +
		        '-' + pad( d.getDate() ) +
		        'T' + pad( d.getHours() ) +
		        ':' + pad( d.getMinutes() ) +
		        ':' + pad( d.getSeconds() );	    
		};

		self.convertStringToISO_noTZ=function(sdate,formatName){
			return self.convertDateToISO_noTZ(self.convertToDate(sdate,formatName));
		};
	//end of DateUtil constructor
	};

	return DateUtil;

})();