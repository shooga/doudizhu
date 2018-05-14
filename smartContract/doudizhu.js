"use strict";

var Doudizhu = function () {
	
};

Doudizhu.prototype = {
    init: function () {
        // todo
    },
	
	// 添加日志
	addLog: function(str)
	{
		var logs = LocalContractStorage.get("log");
		if (logs == undefined)
			logs = [];
		
		if (logs.length > 20)
			logs.pop();
		
		logs.push(str);
		LocalContractStorage.set("log", logs);
	},	
	
	// 添加玩家
	addPlayer: function(addr)
	{
		var players = LocalContractStorage.get("players");
		if (players == undefined)
			players = [];
		
		players.push(addr);
		LocalContractStorage.set("players", players);
	},	
	
	// 获取玩家
    getPlayers: function() {
        var players = LocalContractStorage.get("players");
		return players;
    },
	
	// 清除玩家
	clearPlayers: function()
	{
		var players = [];
		LocalContractStorage.set("players", players);
	},	
	
	// 发放奖励
	sendBonus: function(addr, value)
	{
		if (Blockchain.verifyAddress(addr))
		{
			Blockchain.transfer(addr, value);
		}
	},	
	
	// 加入游戏
    joinGame: function() 
	{
        var from = Blockchain.transaction.from;

		// 查看玩家是否正在玩游戏
        var players = this.getPlayers();
		if (players != undefined)
		{
			var len = players.length;
			for (i = 0; i < len; i++)
			{
				if (players[i] == from)
					throw new Error("You aready in game, please wait for result");
			}			
		}
		
		// 加入
		this.addPlayer(from.toString());
		this.addLog("[" + from.toString() + "] join Game");

		players = this.getPlayers();
		len = players.length;
		
		// 单次押注额度
		var cost = 0.0001;
		
		// 人数满了
		if (len >= 3)
		{
			this.addLog("Game finish, start to send bonus");
			
			// 满三个，开始决定谁是地主
			var rr = Math.floor(Math.random() * len);
			
			// 奖励结果 自己的投入加上地主的一半，扣除千分一的手续费
			var bonusValue = new BigNumber(cost).times("1000000000000000000").mul(1 + 0.5 * 0.999);
			
			// 游戏结束
			// 向长工发放奖励
			var i = 0;
			for (i = 0; i < len; i++)
			{
				if (i != rr)
				{
					this.sendBonus(players[i], bonusValue);
					this.addLog("[" + players[i] + "] gain bonus: " + bonusValue.div("1000000000000000000") + " NAS.")
				}
			}
			
			// 平台收取手续费
			this.sendBonus("n1Rm6JPehhRTtLatuKgYdCd1HiR9Hcvyc7y", new BigNumber(cost).times("1000000000000000000").mul(0.001));
			
			// 清除玩家数据
			this.clearPlayers();
		}
    },
	// 查询日志
    getLog: function() {
        var logs = LocalContractStorage.get("log");
		if (logs != undefined)
			logs.reverse();
		return logs;
    }
};

module.exports = Doudizhu;