// This collection never enters the public page registry, navigation or sitemap.
export const REVIEW_PAGES = [
  ['', 'Overview', 'The project and the proposal.'],
  ['try', 'Try nus', 'Run the published build.'],
  ['architecture', 'Architecture', 'What talks to what.'],
  ['security', 'Security', 'Boundaries and evidence.'],
  ['performance', 'Performance', 'Numbers with their scope.'],
  ['releases', 'Releases', 'Packages and provenance.'],
  ['cef', 'CEF research', 'A bounded browser question.'],
  ['funding', 'Funding', 'Where the grant goes.'],
  ['milestones', 'Milestones', 'Outputs, not promises.'],
  ['limitations', 'Limitations', 'What is not claimed.'],
  ['maintainer', 'Maintainer', 'Who carries the project.']
].map(([slug,title,blurb],i)=>({slug,title,blurb,number:String(i+1).padStart(2,'0'),path:`/review/${slug?slug+'/':''}`,depth:slug?2:1}));
export const reviewHref = (slug, depth) => `${depth===1?'.':'..'}/${slug?slug+'/':''}`;
