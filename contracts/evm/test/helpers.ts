const isNotFound = v => v === -1

const executeAndGetEvent = async (response, eventName) => {
  const receipt = await (await response).wait()
  const index = receipt.events.findIndex(ev => ev.event === eventName)
  if (isNotFound(index)) {
    console.log(receipt.events)
    throw new Error(`Event ${eventName} not found`)
  }
  return receipt.events[index].args
}

module.exports = {executeAndGetEvent}