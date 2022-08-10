import React from 'react';
import { Show, TopToolbar, EditButton } from 'react-admin';

import { ProfileLayout } from '../profile/ProfileShow';

function ActionsOnShow(props) {
  const { basePath, data, resource } = props;
  return (
    <TopToolbar disableGutters>
      <EditButton basePath={basePath} resource={resource} record={data} />
    </TopToolbar>
  );
}

function TeacherShow() {
  return (
    <Show title="Enseignants" actions={<ActionsOnShow />}>
      <ProfileLayout />
    </Show>
  );
}

export default TeacherShow;
