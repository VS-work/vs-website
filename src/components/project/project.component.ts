import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, Title } from '@angular/platform-browser';

import { ProjectsService } from '@services/projects.service';
import { MainService } from '@services/main.service';
import { Member } from '@services/classes/member';
import { Project } from '@services/classes/project';

@Component({
  selector: 'project',
  templateUrl: './project.html'
})

export class ProjectComponent implements OnInit {

  public projectLink: string;
  public pageName: string;
  public project: Project;

  public constructor(public route: ActivatedRoute,
                     public projectsService: ProjectsService,
                     private router: Router,
                     private sanitizer: DomSanitizer,
                     private mainService: MainService,
                     private _titleService: Title) {
  }

  public ngOnInit(): void {
    this.pageName = 'Project page';
    this.route.params.subscribe((params: any) => {
      /* tslint:disable */
      this.projectLink = params['projectLink'];
      /* tslint:enable */
      const project = this.projectsService.getByLink(this.projectLink);

      // setting up <title> and tab name
      this._titleService.setTitle(`Project: ${project.title}`);

      // split items to 4 columns
      const formattedTechnologies = [[], [], [], []];
      const columnsNum = 4;
      project.technologies.forEach((technology: string, index: number) => {
        formattedTechnologies[index % columnsNum].push(technology);
      });
      project.formattedTechnologies = formattedTechnologies;

      // filter related(to this projects) members
      const members = this.mainService.getTeam().filter((member: Member) => {
        return project.members.indexOf(member.memberId) >= 0;
      });
      // split items to 4 columns
      const formattedMembers = [];
      members.forEach((member: Member) => {
        formattedMembers.push({
          avatar: member.avatar,
          name: member.name,
          position: member.position,
          url: member.url
        });
      });
      project.formattedMembers = formattedMembers;

      project.reference = this.mainService.getFeedbackForProject(project.projectId);
      if (project.video) {
        project.video = this.sanitizer.bypassSecurityTrustResourceUrl(project.video);
      }
      this.project = project;
    });
  }

  public goToMember(memberUrl: string): void {
    if (memberUrl) {
      this.router.navigate([`./team/${memberUrl}`]);
    }
  }
}
