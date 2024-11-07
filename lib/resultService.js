function getResult(data) { 
    const total =data[0]["TotalCase"];
    const pass = data[0]["Pass"];
    const fail = data[0]["Fail"];
    let content = `<strong>Total TestCase : <span style = "color:blue;"> ${total}</span><br>
    Passed :<span style = "color:green;"> ${pass}</span><br>
    Failed : <span style = "color:red;"> ${fail}</span></strong>`;
    return content;
}

module.exports = { getResult };