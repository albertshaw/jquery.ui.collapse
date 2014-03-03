jQuery.extend({
	debounce : function (func, wait) {
		var timeout;
		return function () {
			var context = this,
			args = arguments;
			var throttler = function () {
				timeout = null;
				func.apply(context, args);
			};
			clearTimeout(timeout);
			timeout = setTimeout(throttler, wait);
		};
	}
});
(function ($) {
	var myBalanceChartOption = {};
	myBalanceChartOption.series = {
		color : "#afd8f8",
		lines : {
			fill : true,
			fillColor : {
				colors : [{
						opacity : 0.8
					}, {
						opacity : 0.1
					}
				]
			}
		}
	};

	myBalanceChartOption.xaxis = {
		mode : "time",
		timezone : "browser",
		timeformat : "%m/%d"
	};
	myBalanceChartOption.yaxis = {
		min : 0,
		max : 1000,
		tickSize : 250,
		minTickSize : 100
	};
	var currentDate = new Date();
	var startDate;
	function mockData(r) {
		var mockd = [],
		startTime = startDate.getTime(),
		orgVal = 400;
		for (; startTime <= currentDate.getTime(); ) {
			var mdd = [];
			orgVal += Math.ceil((0.6 - Math.random()) * 100 / r);
			mdd.push(startTime);
			mdd.push(orgVal);
			mockd.push(mdd);
			startTime += 86400000;
		}
		mockd.push([startTime, orgVal + Math.ceil((0.6 - Math.random()) * 100 / r)]);
		return mockd;
	}
	var chartdata = {},
	cdata;
	function mockChartXaxis() {
		switch ($("#balanceViewBy").val()) {
		case "3":
			startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 3, currentDate.getDate());
			myBalanceChartOption.xaxis.tickSize = [20, "day"];
			if (!chartdata[3]) {
				chartdata[3] = mockData(3);
			}
			cdata = chartdata[3];
			break;
		case "6":
			startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 6, currentDate.getDate());
			myBalanceChartOption.xaxis.tickSize = [40, "day"];
			if (!chartdata[6]) {
				chartdata[6] = mockData(6);
			}
			cdata = chartdata[6];
			break;
		case "9":
			startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 9, currentDate.getDate());
			myBalanceChartOption.xaxis.tickSize = [60, "day"];
			if (!chartdata[9]) {
				chartdata[9] = mockData(9);
			}
			cdata = chartdata[9];
			break;
		case "12":
			startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 12, currentDate.getDate());
			myBalanceChartOption.xaxis.tickSize = [80, "day"];
			if (!chartdata[12]) {
				chartdata[12] = mockData(12);
			}
			cdata = chartdata[12];
			break;
		case "1":
		default:
			startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate());
			myBalanceChartOption.xaxis.tickSize = [5, "day"];
			if (!chartdata[1]) {
				chartdata[1] = mockData(1);
			}
			cdata = chartdata[1];
			break;
		}
		myBalanceChartOption.xaxis.max = currentDate.getTime();
		myBalanceChartOption.xaxis.min = startDate.getTime();
	}
	mockChartXaxis();
	$.plot($("#myBalanceChart"), [cdata], myBalanceChartOption);
	$(window).resize($.debounce(function () {
			$.plot($("#myBalanceChart"), [cdata], myBalanceChartOption);
		}, 500));
	$("#balanceViewBy").on("change", function () {
		mockChartXaxis();
		$.plot($("#myBalanceChart"), [cdata], myBalanceChartOption);
	});
	var pieChartPaper,
	onactivate = function (event, ui) {
		if (ui.panel.find("#myPortFolioPieChartA").length && !pieChartPaper) {
			var pieChartlabels = [{
					text : "1",
					x : 75,
					y : 270,
					width : 30,
					height : 18
				}, {
					text : "2",
					x : 115,
					y : 270,
					width : 30,
					height : 18
				}, {
					text : "3",
					x : 155,
					y : 270,
					width : 30,
					height : 18
				}, {
					text : "4",
					x : 195,
					y : 270,
					width : 30,
					height : 18
				}
			],
			pieChartColors = ["#3598db", "#2dcc70", "#f39c11", "#e74b3c"];
			pieChartPaper = Raphael("myPortFolioPieChartA", 300, 300);
			pieChartPaper.pieChart(150, 150, 100, [60, 20, 15, 5], {
				title : "A Grade by Term",
				r2 : 70,
				labels : pieChartlabels,
				colors : pieChartColors
			});
			Raphael("myPortFolioPieChartB", 300, 300).pieChart(150, 150, 100, [30, 40, 15, 15], {
				title : "B Grade by Term",
				r2 : 70,
				labels : pieChartlabels,
				colors : pieChartColors
			});
			Raphael("myPortFolioPieChartC", 300, 300).pieChart(150, 150, 100, [40, 30, 25, 5], {
				title : "C Grade by Term",
				r2 : 70,
				labels : pieChartlabels,
				colors : pieChartColors
			});
			Raphael("myPortFolioPieChartD", 300, 300).pieChart(150, 150, 100, [25, 25, 25, 25], {
				title : "D Grade by Term",
				r2 : 70,
				labels : pieChartlabels,
				colors : pieChartColors
			});
		} else if (ui.panel.find("#myBalanceChart").length) {
			if ($("#collapse").collapse("isActive", ui.header[0])) {
				$.plot($("#myBalanceChart"), [cdata], myBalanceChartOption);
			}
		}
	};
	$("#collapse").collapse({
		active : 0,
		header : ".panel-heading",
		collapsible : true,
		heightStyle : "content",
		activate : onactivate
	}).sortable({
		axis : "y",
		handle : ".panel-heading",
		stop : function (event, ui) {
			// IE doesn't register the blur when sorting
			// so trigger focusout handlers to remove .ui-state-focus
			ui.item.children(".panel-heading").triggerHandler("focusout");
		}
	});
	$("#collapse .glyphicon-remove").on("click", function (event) {
		event.stopPropagation();
		$(this).parents(".panel").remove();
		$("#collapse").collapse("refresh");
	});
	$("#collapse .glyphicon-refresh").on("click", function (event) {
		event.stopPropagation();
		$("#collapse").collapse("refresh");
	});
})(jQuery);
