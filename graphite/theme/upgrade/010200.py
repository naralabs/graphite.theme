from Acquisition import aq_inner
from Acquisition import aq_parent


def upgrade(tool):
    """ css and js names changes
    """

    portal = aq_parent(aq_inner(tool))
    setup = portal.portal_setup

    setup.runImportStepFromProfile('profile-graphite.theme:default', 'cssregistry')
    setup.runImportStepFromProfile('profile-graphite.theme:default', 'jsregistry')

    return True
