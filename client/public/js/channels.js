// client/public/js/channels.js

import {
  listChannels,
  createChannel,
  getChannel,
  joinChannel,
  addVideo,
  deleteVideo,
  getCurrentUser
} from './api.js';

(async function() {
  // Authentication check
  const user = getCurrentUser();
  if (!user) {
    alert('Please log in');
    window.location = 'login.html';
    return;
  }

  // Show/hide mentor channel-creation form
  const mentorSection = document.getElementById('mentorSection');
  if (user.role !== 'mentor') {
    mentorSection.style.display = 'none';
  }

  // Logout button
  document.getElementById('nav-logout').onclick = () => {
    localStorage.removeItem('token');
    window.location = 'login.html';
  };

  // Handle channel creation (mentor only)
  document.getElementById('createForm').onsubmit = async e => {
    e.preventDefault();
    const f = e.target;
    const data = {
      title:       f.title.value,
      description: f.description.value,
      subjectTags: f.tags.value.split(',').map(t => t.trim()),
      visibility:  f.visibility.value
    };
    try {
      await createChannel(data);
      f.reset();
      loadChannels();
    } catch (err) {
      alert('Error creating channel: ' + err.message);
    }
  };

  const container = document.getElementById('channelsList');

  // Load and render all channels
  async function loadChannels() {
    container.textContent = 'Loading channels…';
    try {
      const channels = await listChannels();
      container.innerHTML = '';
      if (channels.length === 0) {
        container.textContent = 'No channels available.';
        return;
      }
      channels.forEach(ch => renderChannel(ch));
    } catch (err) {
      container.textContent = 'Error loading channels: ' + err.message;
    }
  }

  // Render a single channel card
  function renderChannel(ch) {
    const div = document.createElement('div');
    div.className = 'channel';
    div.innerHTML = `
      <h3>${ch.title}</h3>
      <p>${ch.description || ''}</p>
      <p><strong>Tags:</strong> ${ch.subjectTags.join(', ')}</p>
      <p><strong>Mentor:</strong> ${ch.mentorId.name} (${ch.mentorId.username})</p>
      <button class="btn btn-view">Details</button>
      <button class="btn btn-join">Join</button>
      <div class="video-list" style="display:none;"></div>
    `;

    // View/details button
    div.querySelector('.btn-view').onclick = async () => {
      const listDiv = div.querySelector('.video-list');
      listDiv.innerHTML = 'Loading video list…';
      listDiv.style.display = '';
      try {
        const full = await getChannel(ch._id);
        // Render existing videos
        listDiv.innerHTML = '';
        if (full.videos.length === 0) {
          listDiv.textContent = 'No videos yet.';
        } else {
          full.videos.forEach(v => {
            const item = document.createElement('div');
            item.className = 'video-item';
            item.innerHTML = `
              <strong>${v.title}</strong>
              &mdash;
              <a href="${v.url}" target="_blank">Watch</a>
            `;
            if (user.role === 'mentor') {
              const delBtn = document.createElement('button');
              delBtn.textContent = 'Remove';
              delBtn.onclick = async () => {
                try {
                  await deleteVideo(ch._id, v._id);
                  item.remove();
                } catch (err) {
                  alert('Error removing video: ' + err.message);
                }
              };
              delBtn.style.marginLeft = '1rem';
              item.appendChild(delBtn);
            }
            listDiv.appendChild(item);
          });
        }

        // Add-video form for mentors
        if (user.role === 'mentor') {
          const form = document.createElement('div');
          form.className = 'add-video';
          form.innerHTML = `
            <h4>Add New Video</h4>
            <input type="text" class="vid-title" placeholder="Title" required><br>
            <input type="text" class="vid-url"   placeholder="URL"   required><br>
            <input type="text" class="vid-desc"  placeholder="Description (optional)"><br>
            <button class="btn btn-add">Add Video</button>
          `;
          form.querySelector('.btn-add').onclick = async () => {
            const url   = form.querySelector('.vid-url').value.trim();
            const title = form.querySelector('.vid-title').value.trim();
            const desc  = form.querySelector('.vid-desc').value.trim();
            if (!url || !title) {
              alert('Title and URL are required');
              return;
            }
            try {
              const newVid = await addVideo(ch._id, { url, title, description: desc });
              // Append new video to list
              const item = document.createElement('div');
              item.className = 'video-item';
              item.innerHTML = `<strong>${newVid.title}</strong> &mdash; <a href="${newVid.url}" target="_blank">Watch</a>`;
              const delBtn = document.createElement('button');
              delBtn.textContent = 'Remove';
              delBtn.onclick = async () => {
                try {
                  await deleteVideo(ch._id, newVid._id);
                  item.remove();
                } catch (err) {
                  alert('Error removing video: ' + err.message);
                }
              };
              delBtn.style.marginLeft = '1rem';
              item.appendChild(delBtn);
              listDiv.insertBefore(item, form);
              form.querySelector('.vid-url').value = '';
              form.querySelector('.vid-title').value = '';
              form.querySelector('.vid-desc').value = '';
            } catch (err) {
              alert('Error adding video: ' + err.message);
            }
          };
          listDiv.appendChild(form);
        }
      } catch (err) {
        listDiv.textContent = 'Error fetching channel details: ' + err.message;
      }
    };

    // Join button
    div.querySelector('.btn-join').onclick = async () => {
      try {
        await joinChannel(ch._id);
        alert('You have joined this channel.');
      } catch (err) {
        alert('Error joining channel: ' + err.message);
      }
    };

    container.appendChild(div);
  }

  // Initialize
  loadChannels();
})();
