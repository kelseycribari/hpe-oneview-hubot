/*
(c) Copyright 2016 Hewlett Packard Enterprise Development LP

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

import Listener from './base-listener';
const Conversation = require('hubot-conversation');

export default class ServerProfilesListener extends Listener {
  constructor(robot, client, transform, serverHardware) {
    super(robot, client, transform);
    this.serverHardware = serverHardware;

    this.switchBoard = new Conversation(robot);

    this.respond(/(?:get|list|show) all (?:server ){0,1}profiles\.$/i, ::this.ListServerProfiles);
    this.respond(/(?:get|list|show) (?:\/rest\/server-profiles\/){0,1}(:<profileId>[a-zA-Z0-9_-]*?)\.$/i, ::this.ListServerProfile);
    this.respond(/(?:get|list|show) (?:\/rest\/server-profiles\/){0,1}(:<profileId>[a-zA-Z0-9_-]*?) compliance(?: preview){0,1}\.$/i, ::this.ListServerProfileCompliancePreview);
    this.respond(/(?:update|make) (?:\/rest\/server-profiles\/){0,1}(:<profileId>[a-zA-Z0-9_-]*?) (?:compliance|compliant)\.$/i, ::this.HandleServerCompliantMessage);
    this.respond(/(?:turn|power) on (?:\/rest\/server-profiles\/){0,1}(:<profileId>[a-zA-Z0-9_-]*?)\.$/i, ::this.PowerOnServerProfile);
    this.respond(/(?:turn|power) off (?:\/rest\/server-profiles\/){0,1}(:<profileId>[a-zA-Z0-9_-]*?)\.$/i, ::this.PowerOffServerProfile);
  }

  ListServerProfiles(msg) {
    this.client.ServerProfiles.getAllServerProfiles().then((res) => {
      return this.transform.send(msg, res, (res.members && res.members.length == 0 ? 'There are no profiles.' : ''));
    }).catch(this.error(msg));
  }

  ListServerProfile(msg) {
    this.client.ServerProfiles.getServerProfile(msg.profileId).then((res) => {
      return this.transform.send(msg, res);
    }).catch(this.error(msg));
  }

  ListServerProfileCompliancePreview(msg) {
    this.client.ServerProfiles.getServerProfileCompliancePreview(msg.profileId).then((res) => {
      //TODO: Need a better way to format compliance preview than this (its just JSON), probably means custom logic in the slack transform to make an attachment object
      return this.transform.send(msg, res, JSON.stringify(res, null, '  '));
    }).catch(this.error(msg));
  }

  MakeServerProfileCompliant(profileId, msg, suppress) {
    let startMessage = false;
    return this.client.ServerProfiles.updateServerProfileCompliance(profileId).feedback((res) => {
      if (!suppress && !startMessage && res.associatedResource.resourceHyperlink) {
        startMessage = true;
        this.transform.text(msg, "Hey " + msg.message.user.name + ", I am making " + this.transform.hyperlink(res.associatedResource.resourceHyperlink, res.associatedResource.resourceName) + " compliant, this may take some time.");
      }
    }).then((res) => {
      if (!suppress) {
        return this.transform.send(msg, res, 'Finished making ' + res.name + ' compliant.');
      }
    });
  }

  HandleServerCompliantMessage(msg) {
    this.MakeServerProfileCompliant(msg.profileId, msg).catch(this.error(msg));
  }

  PowerOnServerProfile(msg) {
    if(this.client.connection.isReadOnly()) {
      return this.transform.text(msg, "Hold on a sec...  You'll have to set readOnly mode to false in your config file first if you want to do that...   ");
    }

    let dialog = this.switchBoard.startDialog(msg);
    this.transform.text(msg, "Ok " + msg.message.user.name + " I am going to power on the server profile.  Are you sure you want to do this? (yes/no)");

    dialog.addChoice(/yes/i, (msg2) => {
      this.client.ServerProfiles.getServerProfile(msg.profileId).then((res) => {
        return this.serverHardware.PowerOnHardware(res.serverHardwareUri, msg);
      }).catch(this.error(msg));

    });

    dialog.addChoice(/no/i, (msg3) => {
      return this.transform.text(msg, "Ok " + msg.message.user.name + " I won't do that.");
    });
  }

  PowerOffServerProfile(msg) {
    if(this.client.connection.isReadOnly()) {
      return this.transform.text(msg, "Hold on a sec...  You'll have to set readOnly mode to false in your config file first if you want to do that...   ");
    }

    let dialog = this.switchBoard.startDialog(msg);
    this.transform.text(msg, "Ok " + msg.message.user.name + " I am going to power off the server profile.  Are you sure you want to do this? (yes/no)");

    dialog.addChoice(/yes/i, (msg2) => {
      this.client.ServerProfiles.getServerProfile(msg.profileId).then((res) => {
        return this.serverHardware.PowerOffHardware(res.serverHardwareUri, msg);
      }).catch(this.error(msg));
    });

    dialog.addChoice(/no/i, (msg3) => {
      return this.transform.text(msg, "Ok " + msg.message.user.name + " I won't do that.");
    });
  }
}